import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { WebSocketGateway } from './websocket.gateway';
import {
  Notification as NotificationEntity,
  NotificationType,
  NotificationPriority,
} from '../../database/entities/notification.entity';

// Re-export for backwards compatibility
export { NotificationType, NotificationPriority };

export interface NotificationPayload {
  id?: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, any>;
  actionUrl?: string;
  priority?: NotificationPriority;
  timestamp?: Date;
}

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    private readonly wsGateway: WebSocketGateway,
    @InjectRepository(NotificationEntity)
    private readonly notificationRepository: Repository<NotificationEntity>,
  ) {}

  /**
   * Send notification to a specific user
   */
  async sendToUser(userId: string, notification: NotificationPayload): Promise<void> {
    try {
      this.logger.log(`Sending notification to user ${userId}: ${notification.type}`);

      // Save to database
      const savedNotification = await this.notificationRepository.save({
        userId,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        data: notification.data,
        actionUrl: notification.actionUrl,
        priority: notification.priority || NotificationPriority.NORMAL,
      });

      // Send via WebSocket
      this.wsGateway.sendToUser(userId, 'notification', {
        id: savedNotification.id,
        type: savedNotification.type,
        title: savedNotification.title,
        message: savedNotification.message,
        data: savedNotification.data,
        actionUrl: savedNotification.actionUrl,
        priority: savedNotification.priority,
        timestamp: savedNotification.createdAt,
        isRead: false,
      });
    } catch (error) {
      this.logger.error(`Failed to send notification to user ${userId}:`, error);
    }
  }

  /**
   * Send notification to users with specific role
   */
  async sendToRole(role: string, notification: NotificationPayload): Promise<void> {
    try {
      this.logger.log(`Sending notification to role ${role}: ${notification.type}`);

      // Note: Role-based notifications are not persisted per-user
      // They are broadcast and users who are online will receive them
      this.wsGateway.sendToRole(role, 'notification', {
        id: this.generateNotificationId(),
        type: notification.type,
        title: notification.title,
        message: notification.message,
        data: notification.data,
        actionUrl: notification.actionUrl,
        priority: notification.priority || NotificationPriority.NORMAL,
        timestamp: new Date(),
        isRead: false,
      });
    } catch (error) {
      this.logger.error(`Failed to send notification to role ${role}:`, error);
    }
  }

  /**
   * Broadcast system announcement to all users
   */
  async broadcastAnnouncement(announcement: Omit<NotificationPayload, 'type'>): Promise<void> {
    try {
      this.logger.log(`Broadcasting announcement: ${announcement.title}`);

      this.wsGateway.broadcast('notification', {
        id: this.generateNotificationId(),
        type: NotificationType.SYSTEM_ANNOUNCEMENT,
        title: announcement.title,
        message: announcement.message,
        data: announcement.data,
        actionUrl: announcement.actionUrl,
        priority: announcement.priority || NotificationPriority.NORMAL,
        timestamp: new Date(),
        isRead: false,
      });
    } catch (error) {
      this.logger.error('Failed to broadcast announcement:', error);
    }
  }

  /**
   * Get user's unread notifications
   */
  async getUnreadNotifications(userId: string, limit = 50): Promise<NotificationEntity[]> {
    return this.notificationRepository.find({
      where: { userId, isRead: false },
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  /**
   * Get user's notifications (paginated)
   */
  async getUserNotifications(
    userId: string,
    page = 1,
    limit = 20,
  ): Promise<{ notifications: NotificationEntity[]; total: number }> {
    const [notifications, total] = await this.notificationRepository.findAndCount({
      where: { userId },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { notifications, total };
  }

  /**
   * Mark notifications as read
   */
  async markAsRead(userId: string, notificationIds: string[]): Promise<number> {
    const result = await this.notificationRepository.update(
      { id: In(notificationIds), userId },
      { isRead: true, readAt: new Date() },
    );
    return result.affected || 0;
  }

  /**
   * Mark all user notifications as read
   */
  async markAllAsRead(userId: string): Promise<number> {
    const result = await this.notificationRepository.update(
      { userId, isRead: false },
      { isRead: true, readAt: new Date() },
    );
    return result.affected || 0;
  }

  /**
   * Get unread count for user
   */
  async getUnreadCount(userId: string): Promise<number> {
    return this.notificationRepository.count({
      where: { userId, isRead: false },
    });
  }

  /**
   * Delete old notifications (cleanup job)
   */
  async deleteOldNotifications(daysOld = 30): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const result = await this.notificationRepository
      .createQueryBuilder()
      .delete()
      .where('created_at < :cutoffDate', { cutoffDate })
      .andWhere('is_read = true')
      .execute();

    return result.affected || 0;
  }

  /**
   * Notify expert about new service request match
   */
  async notifyExpertMatch(
    expertUserId: string,
    serviceRequestId: string,
    matchScore: number,
  ): Promise<void> {
    await this.sendToUser(expertUserId, {
      type: NotificationType.EXPERT_MATCHED,
      title: '新的服务请求匹配',
      message: `您有一个新的服务请求匹配，匹配度: ${matchScore}%`,
      data: {
        serviceRequestId,
        matchScore,
      },
      actionUrl: `/expert/matches/${serviceRequestId}`,
      priority: NotificationPriority.HIGH,
    });
  }

  /**
   * Notify user about inquiry reply
   */
  async notifyInquiryReply(userId: string, inquiryId: string, senderName: string): Promise<void> {
    await this.sendToUser(userId, {
      type: NotificationType.INQUIRY_REPLIED,
      title: '新消息',
      message: `${senderName} 回复了您的询价`,
      data: { inquiryId },
      actionUrl: `/inquiries/${inquiryId}`,
      priority: NotificationPriority.NORMAL,
    });
  }

  /**
   * Notify about device status update
   */
  async notifyDeviceStatusUpdate(
    userIds: string[],
    passportCode: string,
    oldStatus: string,
    newStatus: string,
  ): Promise<void> {
    for (const userId of userIds) {
      await this.sendToUser(userId, {
        type: NotificationType.DEVICE_STATUS_UPDATED,
        title: '设备状态更新',
        message: `设备 ${passportCode} 状态从 ${oldStatus} 更新为 ${newStatus}`,
        data: {
          passportCode,
          oldStatus,
          newStatus,
        },
        actionUrl: `/devices/${passportCode}`,
        priority: NotificationPriority.NORMAL,
      });
    }
  }

  /**
   * Notify about service request assignment
   */
  async notifyServiceRequestAssigned(
    expertUserId: string,
    serviceRequestId: string,
    customerName: string,
  ): Promise<void> {
    await this.sendToUser(expertUserId, {
      type: NotificationType.SERVICE_REQUEST_ASSIGNED,
      title: '新服务订单',
      message: `您被分配了来自 ${customerName} 的新服务请求`,
      data: { serviceRequestId },
      actionUrl: `/expert/service-requests/${serviceRequestId}`,
      priority: NotificationPriority.HIGH,
    });
  }

  /**
   * Check if user is currently online
   */
  isUserOnline(userId: string): boolean {
    return this.wsGateway.isUserConnected(userId);
  }

  /**
   * Get count of currently connected users
   */
  getOnlineUserCount(): number {
    return this.wsGateway.getConnectedUserCount();
  }

  private generateNotificationId(): string {
    return `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
