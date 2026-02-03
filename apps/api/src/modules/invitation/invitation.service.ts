import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual } from 'typeorm';
import {
  InvitationCode,
  InvitationRecord,
  User,
  InviterType,
  InviteeType,
} from '../../database/entities';
import { PointService } from '../point/point.service';

@Injectable()
export class InvitationService {
  constructor(
    @InjectRepository(InvitationCode)
    private invitationCodeRepo: Repository<InvitationCode>,
    @InjectRepository(InvitationRecord)
    private invitationRecordRepo: Repository<InvitationRecord>,
    @InjectRepository(User)
    private userRepo: Repository<User>,
    private pointService: PointService
  ) {}

  // ============================================
  // Invitation Code Management
  // ============================================

  async generateInvitationCode(
    userId: string,
    userType: InviterType,
    options?: {
      maxUses?: number;
      expiresInDays?: number;
      campaign?: string;
      channel?: string;
    }
  ): Promise<InvitationCode> {
    // Generate unique code
    const code = await this.generateUniqueCode();

    const expiresAt = options?.expiresInDays
      ? new Date(Date.now() + options.expiresInDays * 24 * 60 * 60 * 1000)
      : null;

    const invitationCode = this.invitationCodeRepo.create({
      inviterId: userId,
      inviterType: userType,
      code,
      maxUses: options?.maxUses,
      expiresAt,
      campaign: options?.campaign,
      channel: options?.channel,
      isActive: true,
    });

    return this.invitationCodeRepo.save(invitationCode);
  }

  async getMyInvitationCodes(userId: string): Promise<InvitationCode[]> {
    return this.invitationCodeRepo.find({
      where: { inviterId: userId },
      order: { createdAt: 'DESC' },
    });
  }

  async getInvitationCodeByCode(code: string): Promise<InvitationCode | null> {
    return this.invitationCodeRepo.findOne({
      where: { code },
      relations: ['inviter'],
    });
  }

  async validateInvitationCode(code: string): Promise<{
    valid: boolean;
    reason?: string;
    invitationCode?: InvitationCode;
  }> {
    const invitationCode = await this.getInvitationCodeByCode(code);

    if (!invitationCode) {
      return { valid: false, reason: 'Invalid invitation code' };
    }

    if (!invitationCode.isActive) {
      return { valid: false, reason: 'Invitation code is inactive' };
    }

    if (invitationCode.expiresAt && new Date() > invitationCode.expiresAt) {
      return { valid: false, reason: 'Invitation code has expired' };
    }

    if (invitationCode.maxUses && invitationCode.usedCount >= invitationCode.maxUses) {
      return { valid: false, reason: 'Invitation code has reached maximum uses' };
    }

    return { valid: true, invitationCode };
  }

  // ============================================
  // Invitation Record Management
  // ============================================

  async recordInvitation(
    invitationCodeId: string,
    inviterId: string,
    inviteeId: string,
    inviteeType: InviteeType,
    registrationInfo?: {
      ip?: string;
      deviceFingerprint?: string;
    }
  ): Promise<InvitationRecord> {
    // Check if invitee was already invited
    const existingRecord = await this.invitationRecordRepo.findOne({
      where: { inviteeId },
    });

    if (existingRecord) {
      throw new BadRequestException('User has already been invited');
    }

    // Prevent self-invitation
    if (inviterId === inviteeId) {
      throw new BadRequestException('Cannot invite yourself');
    }

    // Create record
    const record = this.invitationRecordRepo.create({
      invitationCodeId,
      inviterId,
      inviteeId,
      inviteeType,
      registrationIp: registrationInfo?.ip,
      deviceFingerprint: registrationInfo?.deviceFingerprint,
    });

    await this.invitationRecordRepo.save(record);

    // Update invitation code usage count
    await this.invitationCodeRepo.increment({ id: invitationCodeId }, 'usedCount', 1);

    return record;
  }

  async processRegistrationReward(inviteeId: string): Promise<void> {
    const record = await this.invitationRecordRepo.findOne({
      where: { inviteeId },
    });

    if (!record || record.registerRewardClaimed) {
      return;
    }

    // Award points to inviter
    await this.pointService.awardPoints(
      record.inviterId,
      'EXPERT', // or determine from user type
      'INVITE_REGISTER',
      {
        relatedUserId: inviteeId,
        description: 'Invited user completed registration',
      }
    );

    // Mark reward as claimed
    record.registerRewardClaimed = true;
    record.registerRewardClaimedAt = new Date();
    await this.invitationRecordRepo.save(record);
  }

  async processFirstOrderReward(inviteeId: string, orderId: string): Promise<void> {
    const record = await this.invitationRecordRepo.findOne({
      where: { inviteeId },
    });

    if (!record || record.firstOrderRewardClaimed) {
      return;
    }

    // Award points to inviter
    await this.pointService.awardPoints(record.inviterId, 'EXPERT', 'INVITE_FIRST_ORDER', {
      relatedUserId: inviteeId,
      relatedServiceRecordId: orderId,
      description: 'Invited user completed first order',
    });

    // Mark reward as claimed
    record.firstOrderRewardClaimed = true;
    record.firstOrderRewardClaimedAt = new Date();
    record.firstOrderAt = new Date();
    record.firstOrderId = orderId;
    await this.invitationRecordRepo.save(record);
  }

  async getMyInvitationRecords(inviterId: string): Promise<{
    records: InvitationRecord[];
    stats: {
      totalInvited: number;
      registeredCount: number;
      firstOrderCount: number;
    };
  }> {
    const records = await this.invitationRecordRepo.find({
      where: { inviterId },
      relations: ['invitee'],
      order: { createdAt: 'DESC' },
    });

    const stats = {
      totalInvited: records.length,
      registeredCount: records.filter((r) => r.registerRewardClaimed).length,
      firstOrderCount: records.filter((r) => r.firstOrderRewardClaimed).length,
    };

    return { records, stats };
  }

  // ============================================
  // Anti-Fraud Detection
  // ============================================

  async checkSuspiciousActivity(
    ip: string,
    deviceFingerprint?: string
  ): Promise<{ suspicious: boolean; reason?: string }> {
    const recentRecords = await this.invitationRecordRepo.find({
      where: [
        {
          registrationIp: ip,
          createdAt: MoreThanOrEqual(new Date(Date.now() - 24 * 60 * 60 * 1000)),
        },
      ],
    });

    if (recentRecords.length >= 3) {
      return {
        suspicious: true,
        reason: 'Too many registrations from same IP in 24 hours',
      };
    }

    if (deviceFingerprint) {
      const deviceRecords = await this.invitationRecordRepo.find({
        where: [
          {
            deviceFingerprint,
            createdAt: MoreThanOrEqual(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)),
          },
        ],
      });

      if (deviceRecords.length >= 3) {
        return {
          suspicious: true,
          reason: 'Too many registrations from same device',
        };
      }
    }

    return { suspicious: false };
  }

  // ============================================
  // Helper Methods
  // ============================================

  private async generateUniqueCode(): Promise<string> {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code: string;
    let exists = true;

    while (exists) {
      let randomPart = '';
      for (let i = 0; i < 6; i++) {
        randomPart += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      code = `INV-${randomPart}`;

      const existing = await this.invitationCodeRepo.findOne({ where: { code } });
      exists = !!existing;
    }

    return code!;
  }

  async deactivateCode(codeId: string, userId: string): Promise<void> {
    const code = await this.invitationCodeRepo.findOne({
      where: { id: codeId, inviterId: userId },
    });

    if (!code) {
      throw new NotFoundException('Invitation code not found');
    }

    code.isActive = false;
    await this.invitationCodeRepo.save(code);
  }
}
