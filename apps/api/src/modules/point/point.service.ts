import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, Between, MoreThanOrEqual } from 'typeorm';
import {
  PointAccount,
  PointTransaction,
  PointRule,
  User,
  PointUserType,
} from '../../database/entities';
import { PointType, CreditLevel, getCreditLevelFromScore } from '@device-passport/shared';

@Injectable()
export class PointService {
  constructor(
    @InjectRepository(PointAccount)
    private pointAccountRepo: Repository<PointAccount>,
    @InjectRepository(PointTransaction)
    private pointTransactionRepo: Repository<PointTransaction>,
    @InjectRepository(PointRule)
    private pointRuleRepo: Repository<PointRule>,
    @InjectRepository(User)
    private userRepo: Repository<User>,
    private dataSource: DataSource,
  ) {}

  // ============================================
  // Point Account Management
  // ============================================

  async getOrCreateAccount(userId: string, userType: PointUserType): Promise<PointAccount> {
    let account = await this.pointAccountRepo.findOne({ where: { userId } });

    if (!account) {
      account = this.pointAccountRepo.create({
        userId,
        userType,
        rewardPoints: 0,
        creditScore: 100,
        creditLevel: CreditLevel.BRONZE,
      });
      await this.pointAccountRepo.save(account);
    }

    return account;
  }

  async getAccountByUserId(userId: string): Promise<PointAccount | null> {
    return this.pointAccountRepo.findOne({
      where: { userId },
      relations: ['user'],
    });
  }

  // ============================================
  // Point Rules Management
  // ============================================

  async getAllRules(): Promise<PointRule[]> {
    return this.pointRuleRepo.find({
      order: { category: 'ASC', sortOrder: 'ASC' },
    });
  }

  async getActiveRules(): Promise<PointRule[]> {
    return this.pointRuleRepo.find({
      where: { isActive: true },
      order: { category: 'ASC', sortOrder: 'ASC' },
    });
  }

  async getRuleByActionCode(actionCode: string): Promise<PointRule | null> {
    return this.pointRuleRepo.findOne({ where: { actionCode } });
  }

  async createRule(data: Partial<PointRule>): Promise<PointRule> {
    if (!data.actionCode) {
      throw new BadRequestException('Action code is required');
    }

    const existing = await this.getRuleByActionCode(data.actionCode);
    if (existing) {
      throw new BadRequestException(`Rule with action code ${data.actionCode} already exists`);
    }

    const rule = this.pointRuleRepo.create(data);
    return this.pointRuleRepo.save(rule);
  }

  async updateRule(id: string, data: Partial<PointRule>): Promise<PointRule> {
    const rule = await this.pointRuleRepo.findOne({ where: { id } });
    if (!rule) {
      throw new NotFoundException('Point rule not found');
    }

    Object.assign(rule, data);
    return this.pointRuleRepo.save(rule);
  }

  async deleteRule(id: string): Promise<void> {
    const result = await this.pointRuleRepo.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException('Point rule not found');
    }
  }

  // ============================================
  // Point Transactions
  // ============================================

  async awardPoints(
    userId: string,
    userType: PointUserType,
    actionCode: string,
    options?: {
      relatedServiceRecordId?: string;
      relatedServiceRequestId?: string;
      relatedUserId?: string;
      relatedTakeoverId?: string;
      relatedReviewId?: string;
      metadata?: Record<string, any>;
      description?: string;
    },
  ): Promise<PointTransaction | null> {
    const rule = await this.getRuleByActionCode(actionCode);
    if (!rule || !rule.isActive) {
      console.warn(`Point rule ${actionCode} not found or inactive`);
      return null;
    }

    // Check limits
    const canAward = await this.checkLimits(userId, actionCode, rule);
    if (!canAward) {
      console.log(`User ${userId} has reached limit for action ${actionCode}`);
      return null;
    }

    // Get or create account
    const account = await this.getOrCreateAccount(userId, userType);

    // Generate transaction code
    const transactionCode = await this.generateTransactionCode();

    // Start transaction
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const points = rule.defaultPoints;
      const balanceBefore = account.rewardPoints;
      const balanceAfter = balanceBefore + points;

      // Create transaction record
      const transaction = this.pointTransactionRepo.create({
        transactionCode,
        userId,
        userType,
        pointType: rule.pointType,
        actionCode,
        points,
        balanceBefore,
        balanceAfter,
        description: options?.description || rule.actionName,
        relatedServiceRecordId: options?.relatedServiceRecordId,
        relatedServiceRequestId: options?.relatedServiceRequestId,
        relatedUserId: options?.relatedUserId,
        relatedTakeoverId: options?.relatedTakeoverId,
        relatedReviewId: options?.relatedReviewId,
        metadata: options?.metadata,
        isApplied: true,
      });

      await queryRunner.manager.save(transaction);

      // Update account
      if (rule.pointType === PointType.REWARD) {
        account.rewardPoints = balanceAfter;
        account.totalEarnedPoints += points > 0 ? points : 0;
        account.totalSpentPoints += points < 0 ? Math.abs(points) : 0;
      } else if (rule.pointType === PointType.CREDIT) {
        account.creditScore += points;
        account.creditLevel = getCreditLevelFromScore(account.creditScore);
      } else if (rule.pointType === PointType.PENALTY) {
        account.creditScore += points; // Points should be negative for penalties
        account.totalPenaltyPoints += Math.abs(points);
        account.creditLevel = getCreditLevelFromScore(account.creditScore);
      }

      await queryRunner.manager.save(account);
      await queryRunner.commitTransaction();

      return transaction;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async checkLimits(
    userId: string,
    actionCode: string,
    rule: PointRule,
  ): Promise<boolean> {
    const now = new Date();

    // Check total limit
    if (rule.totalLimit) {
      const totalCount = await this.pointTransactionRepo.count({
        where: { userId, actionCode, isApplied: true },
      });
      if (totalCount >= rule.totalLimit) {
        return false;
      }
    }

    // Check daily limit
    if (rule.dailyLimit) {
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);

      const dailyCount = await this.pointTransactionRepo.count({
        where: {
          userId,
          actionCode,
          isApplied: true,
          createdAt: Between(startOfDay, endOfDay),
        },
      });
      if (dailyCount >= rule.dailyLimit) {
        return false;
      }
    }

    // Check weekly limit
    if (rule.weeklyLimit) {
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay());
      startOfWeek.setHours(0, 0, 0, 0);

      const weeklyCount = await this.pointTransactionRepo.count({
        where: {
          userId,
          actionCode,
          isApplied: true,
          createdAt: MoreThanOrEqual(startOfWeek),
        },
      });
      if (weeklyCount >= rule.weeklyLimit) {
        return false;
      }
    }

    // Check monthly limit
    if (rule.monthlyLimit) {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      const monthlyCount = await this.pointTransactionRepo.count({
        where: {
          userId,
          actionCode,
          isApplied: true,
          createdAt: MoreThanOrEqual(startOfMonth),
        },
      });
      if (monthlyCount >= rule.monthlyLimit) {
        return false;
      }
    }

    return true;
  }

  async getTransactionHistory(
    userId: string,
    options?: {
      page?: number;
      limit?: number;
      pointType?: PointType;
    },
  ): Promise<{ transactions: PointTransaction[]; total: number }> {
    const page = options?.page || 1;
    const limit = options?.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = { userId };
    if (options?.pointType) {
      where.pointType = options.pointType;
    }

    const [transactions, total] = await this.pointTransactionRepo.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

    return { transactions, total };
  }

  // ============================================
  // Statistics
  // ============================================

  async getPointStatistics(): Promise<{
    totalPointsIssued: number;
    totalPointsConsumed: number;
    totalPenaltyPoints: number;
    netCirculation: number;
    byAction: { actionCode: string; actionName: string; count: number; totalPoints: number }[];
  }> {
    // Overall statistics
    const overallStats = await this.pointTransactionRepo
      .createQueryBuilder('pt')
      .select([
        'SUM(CASE WHEN pt.points > 0 THEN pt.points ELSE 0 END) as "totalPointsIssued"',
        'SUM(CASE WHEN pt.points < 0 AND pt.point_type = :rewardType THEN ABS(pt.points) ELSE 0 END) as "totalPointsConsumed"',
        'SUM(CASE WHEN pt.point_type = :penaltyType THEN ABS(pt.points) ELSE 0 END) as "totalPenaltyPoints"',
      ])
      .setParameter('rewardType', PointType.REWARD)
      .setParameter('penaltyType', PointType.PENALTY)
      .getRawOne();

    // By action statistics
    const byActionStats = await this.pointTransactionRepo
      .createQueryBuilder('pt')
      .leftJoin('point_rules', 'pr', 'pr.action_code = pt.action_code')
      .select([
        'pt.action_code as "actionCode"',
        'COALESCE(pr.action_name, pt.action_code) as "actionName"',
        'COUNT(*) as "count"',
        'SUM(pt.points) as "totalPoints"',
      ])
      .where('pt.is_applied = :applied', { applied: true })
      .groupBy('pt.action_code')
      .addGroupBy('pr.action_name')
      .orderBy('"totalPoints"', 'DESC')
      .limit(10)
      .getRawMany();

    const totalIssued = parseInt(overallStats?.totalPointsIssued || '0', 10);
    const totalConsumed = parseInt(overallStats?.totalPointsConsumed || '0', 10);
    const totalPenalty = parseInt(overallStats?.totalPenaltyPoints || '0', 10);

    return {
      totalPointsIssued: totalIssued,
      totalPointsConsumed: totalConsumed,
      totalPenaltyPoints: totalPenalty,
      netCirculation: totalIssued - totalConsumed,
      byAction: byActionStats.map(s => ({
        actionCode: s.actionCode,
        actionName: s.actionName,
        count: parseInt(s.count, 10),
        totalPoints: parseInt(s.totalPoints, 10),
      })),
    };
  }

  // ============================================
  // Helper Methods
  // ============================================

  private async generateTransactionCode(): Promise<string> {
    const now = new Date();
    const year = now.getFullYear().toString().slice(-2);
    const month = (now.getMonth() + 1).toString().padStart(2, '0');

    // Get count for this month
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const count = await this.pointTransactionRepo.count({
      where: { createdAt: MoreThanOrEqual(startOfMonth) },
    });

    const sequence = (count + 1).toString().padStart(6, '0');
    return `PT-${year}${month}-${sequence}`;
  }

  // ============================================
  // Seed Default Rules
  // ============================================

  async seedDefaultRules(): Promise<void> {
    const defaultRules: Partial<PointRule>[] = [
      // Reward actions
      {
        actionCode: 'PUBLISH_REQUEST',
        actionName: 'Publish Service Request',
        description: 'Reward for publishing a new service request',
        category: 'SERVICE',
        pointType: PointType.REWARD,
        defaultPoints: 10,
        minPoints: 5,
        maxPoints: 50,
        dailyLimit: 3,
        isActive: true,
        sortOrder: 1,
      },
      {
        actionCode: 'FIRST_PUBLISH',
        actionName: 'First Service Request',
        description: 'Bonus for publishing first service request',
        category: 'SERVICE',
        pointType: PointType.REWARD,
        defaultPoints: 50,
        totalLimit: 1,
        isActive: true,
        sortOrder: 2,
      },
      {
        actionCode: 'SERVICE_COMPLETED',
        actionName: 'Complete Service',
        description: 'Reward for expert completing a service',
        category: 'SERVICE',
        pointType: PointType.REWARD,
        defaultPoints: 30,
        minPoints: 10,
        maxPoints: 100,
        isActive: true,
        sortOrder: 3,
      },
      {
        actionCode: 'FIVE_STAR_REVIEW',
        actionName: 'Receive 5-Star Review',
        description: 'Bonus for receiving a 5-star rating',
        category: 'REVIEW',
        pointType: PointType.REWARD,
        defaultPoints: 50,
        minPoints: 20,
        maxPoints: 100,
        isActive: true,
        sortOrder: 4,
      },
      {
        actionCode: 'ON_TIME_COMPLETION',
        actionName: 'On-Time Completion',
        description: 'Bonus for completing service on schedule',
        category: 'SERVICE',
        pointType: PointType.REWARD,
        defaultPoints: 10,
        isActive: true,
        sortOrder: 5,
      },
      {
        actionCode: 'CUSTOMER_CONFIRM',
        actionName: 'Customer Confirms Service',
        description: 'Reward when customer confirms service completion',
        category: 'SERVICE',
        pointType: PointType.REWARD,
        defaultPoints: 15,
        isActive: true,
        sortOrder: 6,
      },
      {
        actionCode: 'GIVE_REVIEW',
        actionName: 'Submit Review',
        description: 'Reward for submitting a review',
        category: 'REVIEW',
        pointType: PointType.REWARD,
        defaultPoints: 10,
        isActive: true,
        sortOrder: 7,
      },
      {
        actionCode: 'INVITE_REGISTER',
        actionName: 'Invite User Registration',
        description: 'Reward when invited user completes registration',
        category: 'REFERRAL',
        pointType: PointType.REWARD,
        defaultPoints: 100,
        minPoints: 50,
        maxPoints: 200,
        isActive: true,
        sortOrder: 8,
      },
      {
        actionCode: 'INVITE_FIRST_ORDER',
        actionName: 'Invited User First Order',
        description: 'Reward when invited user completes first order',
        category: 'REFERRAL',
        pointType: PointType.REWARD,
        defaultPoints: 200,
        minPoints: 100,
        maxPoints: 500,
        isActive: true,
        sortOrder: 9,
      },
      {
        actionCode: 'DEVICE_TAKEOVER',
        actionName: 'Device Takeover Success',
        description: 'Reward for successfully adding device to platform',
        category: 'DEVICE',
        pointType: PointType.REWARD,
        defaultPoints: 50,
        isActive: true,
        sortOrder: 10,
      },
      {
        actionCode: 'DEVICE_INSPECTION',
        actionName: 'Complete Device Inspection',
        description: 'Reward for expert completing device inspection',
        category: 'DEVICE',
        pointType: PointType.REWARD,
        defaultPoints: 30,
        isActive: true,
        sortOrder: 11,
      },
      {
        actionCode: 'COMPLETE_PROFILE',
        actionName: 'Complete Profile',
        description: 'Reward for completing user profile',
        category: 'PROFILE',
        pointType: PointType.REWARD,
        defaultPoints: 100,
        totalLimit: 1,
        isActive: true,
        sortOrder: 12,
      },
      {
        actionCode: 'CONSECUTIVE_LOGIN_7',
        actionName: '7-Day Login Streak',
        description: 'Reward for 7 consecutive days login',
        category: 'ACTIVITY',
        pointType: PointType.REWARD,
        defaultPoints: 20,
        weeklyLimit: 1,
        isActive: true,
        sortOrder: 13,
      },
      {
        actionCode: 'CONSECUTIVE_LOGIN_30',
        actionName: '30-Day Login Streak',
        description: 'Reward for 30 consecutive days login',
        category: 'ACTIVITY',
        pointType: PointType.REWARD,
        defaultPoints: 100,
        monthlyLimit: 1,
        isActive: true,
        sortOrder: 14,
      },
      // Penalty actions
      {
        actionCode: 'CANCEL_ORDER_EXPERT',
        actionName: 'Expert Cancels Order',
        description: 'Penalty for expert canceling accepted order',
        category: 'VIOLATION',
        pointType: PointType.PENALTY,
        defaultPoints: -50,
        minPoints: -100,
        maxPoints: -20,
        isActive: true,
        sortOrder: 100,
      },
      {
        actionCode: 'CANCEL_ORDER_CUSTOMER',
        actionName: 'Customer Cancels Assigned Order',
        description: 'Penalty for customer canceling after expert assigned',
        category: 'VIOLATION',
        pointType: PointType.PENALTY,
        defaultPoints: -30,
        minPoints: -50,
        maxPoints: -10,
        isActive: true,
        sortOrder: 101,
      },
      {
        actionCode: 'SERVICE_TIMEOUT',
        actionName: 'Service Timeout',
        description: 'Penalty for not completing service on time',
        category: 'VIOLATION',
        pointType: PointType.PENALTY,
        defaultPoints: -20,
        isActive: true,
        sortOrder: 102,
      },
      {
        actionCode: 'SERVICE_SEVERE_TIMEOUT',
        actionName: 'Severe Service Timeout',
        description: 'Penalty for service delayed more than 24 hours',
        category: 'VIOLATION',
        pointType: PointType.PENALTY,
        defaultPoints: -50,
        isActive: true,
        sortOrder: 103,
      },
      {
        actionCode: 'VALID_COMPLAINT',
        actionName: 'Receive Valid Complaint',
        description: 'Penalty for receiving a validated complaint',
        category: 'VIOLATION',
        pointType: PointType.PENALTY,
        defaultPoints: -30,
        minPoints: -80,
        maxPoints: -10,
        isActive: true,
        sortOrder: 104,
      },
      {
        actionCode: 'COMPLAINT_ESCALATED',
        actionName: 'Complaint Escalated',
        description: 'Penalty when complaint is escalated for review',
        category: 'VIOLATION',
        pointType: PointType.PENALTY,
        defaultPoints: -80,
        isActive: true,
        sortOrder: 105,
      },
      {
        actionCode: 'MALICIOUS_COMPLAINT',
        actionName: 'Malicious Complaint Filed',
        description: 'Penalty for filing a malicious complaint',
        category: 'VIOLATION',
        pointType: PointType.PENALTY,
        defaultPoints: -100,
        isActive: true,
        sortOrder: 106,
      },
      {
        actionCode: 'ONE_STAR_REVIEW',
        actionName: 'Receive 1-Star Review',
        description: 'Penalty for receiving a 1-star rating',
        category: 'REVIEW',
        pointType: PointType.PENALTY,
        defaultPoints: -20,
        isActive: true,
        sortOrder: 107,
      },
      {
        actionCode: 'FAKE_REVIEW',
        actionName: 'Fake Review Detected',
        description: 'Penalty for submitting a fake review',
        category: 'VIOLATION',
        pointType: PointType.PENALTY,
        defaultPoints: -100,
        isActive: true,
        sortOrder: 108,
      },
      {
        actionCode: 'HARASSMENT',
        actionName: 'Harassment/Abuse',
        description: 'Penalty for harassment or abusive behavior',
        category: 'VIOLATION',
        pointType: PointType.PENALTY,
        defaultPoints: -100,
        minPoints: -200,
        maxPoints: -50,
        isActive: true,
        sortOrder: 109,
      },
      {
        actionCode: 'FRAUD',
        actionName: 'Fraudulent Activity',
        description: 'Penalty for fraudulent behavior',
        category: 'VIOLATION',
        pointType: PointType.PENALTY,
        defaultPoints: -500,
        isActive: true,
        sortOrder: 110,
      },
      {
        actionCode: 'NO_SHOW',
        actionName: 'No-Show After Booking',
        description: 'Penalty for not showing up after booking',
        category: 'VIOLATION',
        pointType: PointType.PENALTY,
        defaultPoints: -40,
        isActive: true,
        sortOrder: 111,
      },
    ];

    for (const ruleData of defaultRules) {
      const existing = await this.getRuleByActionCode(ruleData.actionCode!);
      if (!existing) {
        await this.createRule(ruleData);
        console.log(`Created point rule: ${ruleData.actionCode}`);
      }
    }
  }
}
