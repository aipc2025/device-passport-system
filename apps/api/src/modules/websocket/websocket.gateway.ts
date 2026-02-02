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

  constructor(private readonly jwtService: JwtService) {}

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

      // Verify JWT token
      const payload = await this.jwtService.verifyAsync(token);
      client.userId = payload.sub;
      client.userRole = payload.role;

      // Track connected user
      if (client.userId) {
        if (!this.connectedUsers.has(client.userId)) {
          this.connectedUsers.set(client.userId, new Set());
        }
        this.connectedUsers.get(client.userId)!.add(client.id);

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

    this.logger.log(`Client ${client.id} disconnected`);
  }

  @SubscribeMessage('ping')
  handlePing(@ConnectedSocket() client: AuthSocket) {
    return { event: 'pong', data: { timestamp: Date.now() } };
  }

  @SubscribeMessage('subscribe')
  handleSubscribe(
    @MessageBody() data: { channels: string[] },
    @ConnectedSocket() client: AuthSocket,
  ) {
    const { channels } = data;

    channels.forEach((channel) => {
      client.join(channel);
      this.logger.log(`Client ${client.id} subscribed to ${channel}`);
    });

    return {
      event: 'subscribed',
      data: { channels },
    };
  }

  @SubscribeMessage('unsubscribe')
  handleUnsubscribe(
    @MessageBody() data: { channels: string[] },
    @ConnectedSocket() client: AuthSocket,
  ) {
    const { channels } = data;

    channels.forEach((channel) => {
      client.leave(channel);
      this.logger.log(`Client ${client.id} unsubscribed from ${channel}`);
    });

    return {
      event: 'unsubscribed',
      data: { channels },
    };
  }

  @SubscribeMessage('mark_read')
  handleMarkRead(
    @MessageBody() data: { notificationIds: string[] },
    @ConnectedSocket() client: AuthSocket,
  ) {
    this.logger.log(
      `User ${client.userId} marked notifications as read: ${data.notificationIds.join(', ')}`
    );

    // Emit to all user's connected clients
    this.server.to(`user:${client.userId}`).emit('notifications_read', {
      notificationIds: data.notificationIds,
    });

    return { event: 'marked_read', data: { success: true } };
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
}
