import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IndividualExpert, ServiceOrder } from '../../database/entities';

@Injectable()
export class ExpertService {
  constructor(
    @InjectRepository(IndividualExpert)
    private expertRepository: Repository<IndividualExpert>,
    @InjectRepository(ServiceOrder)
    private serviceOrderRepository: Repository<ServiceOrder>,
  ) {}

  async getProfile(expertId: string, userId: string): Promise<IndividualExpert> {
    const expert = await this.expertRepository.findOne({
      where: { id: expertId },
      relations: ['user'],
    });

    if (!expert) {
      throw new NotFoundException('Expert profile not found');
    }

    // Verify the user owns this profile
    if (expert.userId !== userId) {
      throw new ForbiddenException('Not authorized to access this profile');
    }

    return expert;
  }

  async updateProfile(
    expertId: string,
    userId: string,
    data: Partial<IndividualExpert>,
  ): Promise<IndividualExpert> {
    const expert = await this.getProfile(expertId, userId);

    // Don't allow updating certain fields
    const { id, userId: _, registrationStatus, adminNotes, reviewedBy, reviewedAt, createdAt, updatedAt, ...updateData } = data as any;

    Object.assign(expert, updateData);
    return this.expertRepository.save(expert);
  }

  async getServiceRecords(expertId: string, userId: string): Promise<any[]> {
    // First verify the expert profile belongs to the user
    await this.getProfile(expertId, userId);

    // Get service orders assigned to this expert (as engineer)
    const serviceOrders = await this.serviceOrderRepository.find({
      where: { assignedEngineerId: userId },
      relations: ['passport', 'customer', 'creator'],
      order: { createdAt: 'DESC' },
    });

    // Transform to service records format
    return serviceOrders.map((order) => ({
      id: order.id,
      serviceOrderId: order.id,
      serviceOrderCode: order.orderNumber,
      title: order.title,
      description: order.description,
      customerName: order.contactName || order.customerName || 'Unknown',
      customerOrganization: order.customer?.name,
      location: order.serviceAddress,
      serviceDate: order.scheduledDate,
      completedAt: order.completedDate,
      status: order.status,
      // Note: Rating/review fields would need to be added to the entity if needed
      rating: undefined,
      review: undefined,
      reviewedAt: undefined,
    }));
  }

  async getMatches(expertId: string, userId: string, limit = 50): Promise<any[]> {
    // Verify the expert profile belongs to the user
    await this.getProfile(expertId, userId);

    // For now, return empty array - this would be implemented with a proper matching system
    // Similar to the buyer/supplier matching but for service requests to experts
    return [];
  }

  async dismissMatch(matchId: string, userId: string): Promise<void> {
    // Implementation for dismissing an expert match
    // This would update the match status to DISMISSED
  }
}
