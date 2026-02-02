import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import {
  DevicePassport,
  LifecycleEvent,
  ServiceOrder,
  ServiceRequest,
  IndividualExpert,
} from '../../database/entities';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(DevicePassport)
    private readonly passportRepository: Repository<DevicePassport>,
    @InjectRepository(LifecycleEvent)
    private readonly lifecycleRepository: Repository<LifecycleEvent>,
    @InjectRepository(ServiceOrder)
    private readonly serviceOrderRepository: Repository<ServiceOrder>,
    @InjectRepository(ServiceRequest)
    private readonly serviceRequestRepository: Repository<ServiceRequest>,
    @InjectRepository(IndividualExpert)
    private readonly expertRepository: Repository<IndividualExpert>,
  ) {}

  /**
   * Get dashboard overview statistics
   */
  async getDashboardOverview() {
    const [
      totalPassports,
      activePassports,
      totalServiceOrders,
      pendingServiceOrders,
      totalExperts,
      availableExperts,
      totalServiceRequests,
      openServiceRequests,
    ] = await Promise.all([
      this.passportRepository.count(),
      this.passportRepository.count({ where: { status: 'IN_SERVICE' } as any }),
      this.serviceOrderRepository.count(),
      this.serviceOrderRepository.count({
        where: { status: 'PENDING' } as any,
      }),
      this.expertRepository.count(),
      this.expertRepository.count({
        where: { isAvailable: true, registrationStatus: 'APPROVED' } as any,
      }),
      this.serviceRequestRepository.count(),
      this.serviceRequestRepository.count({ where: { status: 'PUBLISHED' } as any }),
    ]);

    return {
      passports: {
        total: totalPassports,
        active: activePassports,
        inactiveRate: totalPassports > 0
          ? ((totalPassports - activePassports) / totalPassports * 100).toFixed(1)
          : 0,
      },
      serviceOrders: {
        total: totalServiceOrders,
        pending: pendingServiceOrders,
        completionRate: totalServiceOrders > 0
          ? (((totalServiceOrders - pendingServiceOrders) / totalServiceOrders) * 100).toFixed(1)
          : 0,
      },
      experts: {
        total: totalExperts,
        available: availableExperts,
        availabilityRate: totalExperts > 0
          ? ((availableExperts / totalExperts) * 100).toFixed(1)
          : 0,
      },
      serviceRequests: {
        total: totalServiceRequests,
        open: openServiceRequests,
      },
    };
  }

  /**
   * Get passports count grouped by status
   */
  async getPassportsByStatus() {
    const results = await this.passportRepository
      .createQueryBuilder('passport')
      .select('passport.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .groupBy('passport.status')
      .getRawMany();

    return results.map((r) => ({
      name: r.status,
      value: parseInt(r.count),
    }));
  }

  /**
   * Get passports count grouped by product line
   */
  async getPassportsByProductLine() {
    const results = await this.passportRepository
      .createQueryBuilder('passport')
      .select('passport.product_line', 'productLine')
      .addSelect('COUNT(*)', 'count')
      .groupBy('passport.product_line')
      .getRawMany();

    return results.map((r) => ({
      name: r.productLine || 'Unknown',
      value: parseInt(r.count),
    }));
  }

  /**
   * Get passports creation trend over time
   */
  async getPassportsTrend(days: number = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const results = await this.passportRepository
      .createQueryBuilder('passport')
      .select("DATE(passport.created_at)", 'date')
      .addSelect('COUNT(*)', 'count')
      .where('passport.created_at >= :startDate', { startDate })
      .groupBy('DATE(passport.created_at)')
      .orderBy('DATE(passport.created_at)', 'ASC')
      .getRawMany();

    return results.map((r) => ({
      date: r.date,
      count: parseInt(r.count),
    }));
  }

  /**
   * Get lifecycle events distribution
   */
  async getLifecycleDistribution() {
    const results = await this.lifecycleRepository
      .createQueryBuilder('event')
      .select('event.event_type', 'eventType')
      .addSelect('COUNT(*)', 'count')
      .groupBy('event.event_type')
      .getRawMany();

    return results.map((r) => ({
      name: r.eventType,
      value: parseInt(r.count),
    }));
  }

  /**
   * Get service orders count by status
   */
  async getServiceOrdersByStatus() {
    const results = await this.serviceOrderRepository
      .createQueryBuilder('order')
      .select('order.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .groupBy('order.status')
      .getRawMany();

    return results.map((r) => ({
      name: r.status,
      value: parseInt(r.count),
    }));
  }

  /**
   * Get service orders trend over time
   */
  async getServiceOrdersTrend(days: number = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const results = await this.serviceOrderRepository
      .createQueryBuilder('order')
      .select("DATE(order.created_at)", 'date')
      .addSelect('COUNT(*)', 'total')
      .addSelect(
        "COUNT(CASE WHEN order.status = 'COMPLETED' THEN 1 END)",
        'completed',
      )
      .addSelect(
        "COUNT(CASE WHEN order.status = 'PENDING' THEN 1 END)",
        'pending',
      )
      .where('order.created_at >= :startDate', { startDate })
      .groupBy('DATE(order.created_at)')
      .orderBy('DATE(order.created_at)', 'ASC')
      .getRawMany();

    return results.map((r) => ({
      date: r.date,
      total: parseInt(r.total),
      completed: parseInt(r.completed || 0),
      pending: parseInt(r.pending || 0),
    }));
  }

  /**
   * Get expert statistics
   */
  async getExpertStatistics() {
    const [
      total,
      approved,
      pending,
      available,
      byType,
    ] = await Promise.all([
      this.expertRepository.count(),
      this.expertRepository.count({ where: { registrationStatus: 'APPROVED' } as any }),
      this.expertRepository.count({ where: { registrationStatus: 'PENDING' } as any }),
      this.expertRepository.count({ where: { isAvailable: true } as any }),
      this.expertRepository
        .createQueryBuilder('expert')
        .select("expert.expert_types::text", 'types')
        .getRawMany(),
    ]);

    // Count expert types
    const typeCount: Record<string, number> = {};
    byType.forEach((expert) => {
      if (expert.types) {
        try {
          const types = JSON.parse(expert.types.replace(/'/g, '"'));
          types.forEach((type: string) => {
            typeCount[type] = (typeCount[type] || 0) + 1;
          });
        } catch (e) {
          // Skip invalid JSON
        }
      }
    });

    return {
      total,
      approved,
      pending,
      available,
      approvalRate: total > 0 ? ((approved / total) * 100).toFixed(1) : 0,
      availabilityRate: approved > 0 ? ((available / approved) * 100).toFixed(1) : 0,
      byType: Object.entries(typeCount).map(([name, value]) => ({
        name,
        value,
      })),
    };
  }

  /**
   * Get service requests count by urgency
   */
  async getServiceRequestsByUrgency() {
    const results = await this.serviceRequestRepository
      .createQueryBuilder('request')
      .select('request.urgency', 'urgency')
      .addSelect('COUNT(*)', 'count')
      .groupBy('request.urgency')
      .getRawMany();

    return results.map((r) => ({
      name: r.urgency || 'NORMAL',
      value: parseInt(r.count),
    }));
  }

  /**
   * Get average response times for service requests
   */
  async getResponseTimes() {
    const results = await this.serviceRequestRepository
      .createQueryBuilder('request')
      .select('request.service_type', 'serviceType')
      .addSelect(
        'AVG(EXTRACT(EPOCH FROM (request.accepted_at - request.published_at)) / 3600)',
        'avgResponseHours',
      )
      .where('request.accepted_at IS NOT NULL')
      .andWhere('request.published_at IS NOT NULL')
      .groupBy('request.service_type')
      .getRawMany();

    return results.map((r) => ({
      serviceType: r.serviceType,
      avgResponseHours: parseFloat(r.avgResponseHours || 0).toFixed(1),
    }));
  }
}
