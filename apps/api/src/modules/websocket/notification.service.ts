import { Injectable, Logger } from '@nestjs/common';
import { WebSocketGateway } from './websocket.gateway';

export enum NotificationType {
  SERVICE_REQUEST_CREATED = 'service_request_created',
  SERVICE_REQUEST_ASSIGNED = 'service_request_assigned',
  SERVICE_REQUEST_COMPLETED = 'service_request_completed',
  EXPERT_MATCHED = 'expert_matched',
  INQUIRY_RECEIVED = 'inquiry_received',
  INQUIRY_REPLIED = 'inquiry_replied',
  MATCH_RESULT_NEW = 'match_result_new',
  ORDER_STATUS_UPDATED = 'order_status_updated',
  DEVICE_STATUS_UPDATED = 'device_status_updated',
  EXPERT_STATUS_CHANGED = 'expert_status_changed',
  SYSTEM_ANNOUNCEMENT = 'system_announcement',
}

export interface Notification {
  id?: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, any>;
  actionUrl?: string;
  priority?: 'low' | 'normal' | 'high';
  timestamp: Date;
}

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(private readonly wsGateway: WebSocketGateway) {}

  /**
   * Send notification to a specific user
   */
  async sendToUser(userId: string, notification: Notification): Promise<void> {
    try {
      this.logger.log(`Sending notification to user ${userId}: ${notification.type}`);

      this.wsGateway.sendToUser(userId, 'notification', {
        ...notification,
        id: notification.id || this.generateNotificationId(),
        timestamp: notification.timestamp || new Date(),
      });

      // TODO: Also save to database for persistence
      // TODO: Send push notification if user is offline
    } catch (error) {
      this.logger.error(`Failed to send notification to user ${userId}:`, error);
    }
  }

  /**
   * Send notification to users with specific role
   */
  async sendToRole(role: string, notification: Notification): Promise<void> {
    try {
      this.logger.log(`Sending notification to role ${role}: ${notification.type}`);

      this.wsGateway.sendToRole(role, 'notification', {
        ...notification,
        id: notification.id || this.generateNotificationId(),
        timestamp: notification.timestamp || new Date(),
      });
    } catch (error) {
      this.logger.error(`Failed to send notification to role ${role}:`, error);
    }
  }

  /**
   * Broadcast system announcement to all users
   */
  async broadcastAnnouncement(announcement: Omit<Notification, 'type'>): Promise<void> {
    try {
      this.logger.log(`Broadcasting announcement: ${announcement.title}`);

      this.wsGateway.broadcast('notification', {
        ...announcement,
        type: NotificationType.SYSTEM_ANNOUNCEMENT,
        id: this.generateNotificationId(),
        timestamp: new Date(),
      });
    } catch (error) {
      this.logger.error('Failed to broadcast announcement:', error);
    }
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
      priority: 'high',
      timestamp: new Date(),
    });
  }

  /**
   * Notify user about inquiry reply
   */
  async notifyInquiryReply(
    userId: string,
    inquiryId: string,
    senderName: string,
  ): Promise<void> {
    await this.sendToUser(userId, {
      type: NotificationType.INQUIRY_REPLIED,
      title: '新消息',
      message: `${senderName} 回复了您的询价`,
      data: { inquiryId },
      actionUrl: `/inquiries/${inquiryId}`,
      priority: 'normal',
      timestamp: new Date(),
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
    const notification: Notification = {
      type: NotificationType.DEVICE_STATUS_UPDATED,
      title: '设备状态更新',
      message: `设备 ${passportCode} 状态从 ${oldStatus} 更新为 ${newStatus}`,
      data: {
        passportCode,
        oldStatus,
        newStatus,
      },
      actionUrl: `/devices/${passportCode}`,
      priority: 'normal',
      timestamp: new Date(),
    };

    for (const userId of userIds) {
      await this.sendToUser(userId, notification);
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
      priority: 'high',
      timestamp: new Date(),
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
