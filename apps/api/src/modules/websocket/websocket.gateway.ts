import {
  WebSocketGateway as WSGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, UseGuards } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

interface AuthSocket extends Socket {
  userId?: string;
  userRole?: string;
  id: string;
  handshake: {
    auth?: { token?: string };
    headers?: { authorization?: string };
  };
  join(room: string | string[]): void;
  leave(room: string): void;
  emit(event: string, ...args: any[]): boolean;
  disconnect(close?: boolean): void;
}

@WSGateway({
  cors: {
    origin: process.env.CORS_ORIGINS?.split(',') || '*',
    credentials: true,
  },
  namespace: '/notifications',
})
export class WebSocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(WebSocketGateway.name);
  private readonly connectedUsers = new Map<string, Set<string>>(); // userId -> Set of socketIds
  private readonly connectionTimestamps = new Map<string, number>(); // socketId -> timestamp
  private readonly JWT_VERIFY_TIMEOUT = 5000; // 5 seconds
  private readonly CONNECTION_TIMEOUT = 30000; // 30 seconds without activity
  private readonly MAX_CONNECTIONS_PER_USER = 5;

  constructor(private readonly jwtService: JwtService) {
    // Start connection monitor
    this.startConnectionMonitor();
  }

  async handleConnection(client: AuthSocket) {
    try {
      // Extract token from handshake auth
      const token = client.handshake.auth?.token ||
        client.handshake.headers?.authorization?.replace('Bearer ', '');

      if (!token) {
        this.logger.warn(`Client ${client.id} connected without token`);
        client.disconnect();
        return;
      }

      // Verify JWT token with timeout
      const payload = await Promise.race([
        this.jwtService.verifyAsync(token),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('JWT verification timeout')), this.JWT_VERIFY_TIMEOUT)
        )
      ]);
      client.userId = (payload as any).sub;
      client.userRole = (payload as any).role;

      // Track connected user
      if (client.userId) {
        // Check max connections per user
        const existingConnections = this.connectedUsers.get(client.userId);
        if (existingConnections && existingConnections.size >= this.MAX_CONNECTIONS_PER_USER) {
          this.logger.warn(
            `User ${client.userId} exceeded max connections (${this.MAX_CONNECTIONS_PER_USER})`
          );
          client.emit('error', {
            message: 'Maximum connection limit reached',
            code: 'MAX_CONNECTIONS_EXCEEDED'
          });
          client.disconnect();
          return;
        }

        if (!this.connectedUsers.has(client.userId)) {
          this.connectedUsers.set(client.userId, new Set());
        }
        this.connectedUsers.get(client.userId)!.add(client.id);
        this.connectionTimestamps.set(client.id, Date.now());

        // Join user-specific room
        client.join(`user:${client.userId}`);
      }

      // Join role-specific room
      if (client.userRole) {
        client.join(`role:${client.userRole}`);
      }

      this.logger.log(
        `Client ${client.id} connected (User: ${client.userId}, Role: ${client.userRole})`
      );

      // Send welcome message
      client.emit('connected', {
        message: 'Successfully connected to notification service',
        userId: client.userId,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Connection error for client ${client.id}:`, errorMessage);
      client.emit('error', { message: 'Authentication failed' });
      client.disconnect();
    }
  }

  handleDisconnect(client: AuthSocket) {
    if (client.userId) {
      const userSockets = this.connectedUsers.get(client.userId);
      if (userSockets) {
        userSockets.delete(client.id);
        if (userSockets.size === 0) {
          this.connectedUsers.delete(client.userId);
        }
      }
    }

    // Clean up timestamp tracking
    this.connectionTimestamps.delete(client.id);

    this.logger.log(`Client ${client.id} disconnected`);
  }

  @SubscribeMessage('ping')
  handlePing(@ConnectedSocket() client: AuthSocket) {
    // Update connection timestamp to track activity
    this.connectionTimestamps.set(client.id, Date.now());
    return { event: 'pong', data: { timestamp: Date.now() } };
  }

  @SubscribeMessage('subscribe')
  handleSubscribe(
    @MessageBody() data: { channels: string[] },
    @ConnectedSocket() client: AuthSocket,
  ) {
    try {
      // Input validation
      if (!data || !Array.isArray(data.channels) || data.channels.length === 0) {
        client.emit('error', {
          event: 'subscribe',
          message: 'Invalid channels array'
        });
        return { event: 'error', data: { message: 'Invalid channels array' } };
      }

      // Limit number of channels per request
      if (data.channels.length > 10) {
        client.emit('error', {
          event: 'subscribe',
          message: 'Cannot subscribe to more than 10 channels at once'
        });
        return { event: 'error', data: { message: 'Too many channels' } };
      }

      const { channels } = data;
      const allowedChannels: string[] = [];
      const deniedChannels: string[] = [];

      channels.forEach((channel) => {
        // Sanitize channel name
        const sanitizedChannel = channel.trim();
        if (!sanitizedChannel || sanitizedChannel.length > 100) {
          deniedChannels.push(channel);
          return;
        }

        // Channel authorization logic
        if (this.isChannelAuthorized(sanitizedChannel, client)) {
          client.join(sanitizedChannel);
          allowedChannels.push(sanitizedChannel);
          this.logger.log(`Client ${client.id} subscribed to ${sanitizedChannel}`);
        } else {
          deniedChannels.push(sanitizedChannel);
          this.logger.warn(
            `Client ${client.id} denied subscription to ${sanitizedChannel} (unauthorized)`
          );
        }
      });

      return {
        event: 'subscribed',
        data: {
          allowedChannels,
          deniedChannels: deniedChannels.length > 0 ? deniedChannels : undefined
        },
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Subscribe error for client ${client.id}:`, errorMessage);
      client.emit('error', {
        event: 'subscribe',
        message: 'Failed to process subscription'
      });
      return { event: 'error', data: { message: 'Subscription failed' } };
    }
  }

  @SubscribeMessage('unsubscribe')
  handleUnsubscribe(
    @MessageBody() data: { channels: string[] },
    @ConnectedSocket() client: AuthSocket,
  ) {
    try {
      // Input validation
      if (!data || !Array.isArray(data.channels) || data.channels.length === 0) {
        client.emit('error', {
          event: 'unsubscribe',
          message: 'Invalid channels array'
        });
        return { event: 'error', data: { message: 'Invalid channels array' } };
      }

      // Limit number of channels per request
      if (data.channels.length > 10) {
        client.emit('error', {
          event: 'unsubscribe',
          message: 'Cannot unsubscribe from more than 10 channels at once'
        });
        return { event: 'error', data: { message: 'Too many channels' } };
      }

      const { channels } = data;
      const unsubscribedChannels: string[] = [];

      channels.forEach((channel) => {
        const sanitizedChannel = channel.trim();
        if (sanitizedChannel && sanitizedChannel.length <= 100) {
          client.leave(sanitizedChannel);
          unsubscribedChannels.push(sanitizedChannel);
          this.logger.log(`Client ${client.id} unsubscribed from ${sanitizedChannel}`);
        }
      });

      return {
        event: 'unsubscribed',
        data: { channels: unsubscribedChannels },
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Unsubscribe error for client ${client.id}:`, errorMessage);
      client.emit('error', {
        event: 'unsubscribe',
        message: 'Failed to process unsubscription'
      });
      return { event: 'error', data: { message: 'Unsubscription failed' } };
    }
  }

  @SubscribeMessage('mark_read')
  handleMarkRead(
    @MessageBody() data: { notificationIds: string[] },
    @ConnectedSocket() client: AuthSocket,
  ) {
    try {
      // Input validation
      if (!data || !Array.isArray(data.notificationIds)) {
        client.emit('error', {
          event: 'mark_read',
          message: 'Invalid notificationIds array'
        });
        return { event: 'error', data: { message: 'Invalid notificationIds array' } };
      }

      if (data.notificationIds.length === 0) {
        return { event: 'marked_read', data: { success: true, count: 0 } };
      }

      // Limit number of notifications per request
      if (data.notificationIds.length > 100) {
        client.emit('error', {
          event: 'mark_read',
          message: 'Cannot mark more than 100 notifications at once'
        });
        return { event: 'error', data: { message: 'Too many notifications' } };
      }

      // Validate all IDs are UUIDs or valid strings
      const validIds = data.notificationIds.filter(id => {
        return typeof id === 'string' && id.length > 0 && id.length <= 36;
      });

      if (validIds.length === 0) {
        client.emit('error', {
          event: 'mark_read',
          message: 'No valid notification IDs provided'
        });
        return { event: 'error', data: { message: 'No valid IDs' } };
      }

      this.logger.log(
        `User ${client.userId} marked ${validIds.length} notifications as read`
      );

      // TODO: Validate user owns these notifications before marking as read
      // For now, trust the client since we're using authenticated connections

      // Emit to all user's connected clients
      this.server.to(`user:${client.userId}`).emit('notifications_read', {
        notificationIds: validIds,
      });

      return {
        event: 'marked_read',
        data: {
          success: true,
          count: validIds.length,
          invalidCount: data.notificationIds.length - validIds.length
        }
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Mark read error for client ${client.id}:`, errorMessage);
      client.emit('error', {
        event: 'mark_read',
        message: 'Failed to mark notifications as read'
      });
      return { event: 'error', data: { message: 'Operation failed' } };
    }
  }

  // Utility methods for sending notifications
  sendToUser(userId: string, event: string, data: any) {
    this.server.to(`user:${userId}`).emit(event, data);
  }

  sendToRole(role: string, event: string, data: any) {
    this.server.to(`role:${role}`).emit(event, data);
  }

  sendToChannel(channel: string, event: string, data: any) {
    this.server.to(channel).emit(event, data);
  }

  broadcast(event: string, data: any) {
    this.server.emit(event, data);
  }

  isUserConnected(userId: string): boolean {
    return this.connectedUsers.has(userId) && this.connectedUsers.get(userId)!.size > 0;
  }

  getConnectedUserCount(): number {
    return this.connectedUsers.size;
  }

  /**
   * Monitor inactive connections and disconnect them
   */
  private startConnectionMonitor() {
    setInterval(() => {
      const now = Date.now();
      const socketsToDisconnect: string[] = [];

      this.connectionTimestamps.forEach((timestamp, socketId) => {
        if (now - timestamp > this.CONNECTION_TIMEOUT) {
          socketsToDisconnect.push(socketId);
        }
      });

      if (socketsToDisconnect.length > 0) {
        this.logger.log(`Disconnecting ${socketsToDisconnect.length} inactive connections`);
        socketsToDisconnect.forEach(socketId => {
          const socket = this.server.sockets.sockets.get(socketId);
          if (socket) {
            socket.emit('error', {
              message: 'Connection timeout due to inactivity',
              code: 'TIMEOUT'
            });
            socket.disconnect(true);
          }
          this.connectionTimestamps.delete(socketId);
        });
      }
    }, 60000); // Check every minute
  }

  /**
   * Check if a user is authorized to subscribe to a channel
   */
  private isChannelAuthorized(channel: string, client: AuthSocket): boolean {
    // Public channels - accessible to all authenticated users
    const publicChannels = ['system', 'announcements', 'marketplace'];
    if (publicChannels.includes(channel)) {
      return true;
    }

    // User-specific channels - only accessible to the user
    if (channel.startsWith('user:')) {
      const targetUserId = channel.substring(5);
      return targetUserId === client.userId;
    }

    // Role-based channels - accessible to users with matching role
    if (channel.startsWith('role:')) {
      const targetRole = channel.substring(5);
      return targetRole === client.userRole;
    }

    // Organization channels - format: org:{orgId}
    if (channel.startsWith('org:')) {
      // TODO: Validate user belongs to organization
      // For now, allow all authenticated users
      return true;
    }

    // Passport-specific channels - format: passport:{passportCode}
    if (channel.startsWith('passport:')) {
      // TODO: Validate user has access to passport
      // For now, allow all authenticated users
      return true;
    }

    // Service request channels - format: service-request:{requestId}
    if (channel.startsWith('service-request:')) {
      // TODO: Validate user is involved in service request
      // For now, allow all authenticated users
      return true;
    }

    // Expert channels - format: expert:{expertId}
    if (channel.startsWith('expert:')) {
      const targetExpertId = channel.substring(7);
      // Allow user to subscribe to their own expert channel
      // TODO: Validate expertId belongs to user
      return true;
    }

    // Deny access to unknown channel patterns
    this.logger.warn(`Unknown channel pattern: ${channel}`);
    return false;
  }
}
