import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { WebSocketGateway } from './websocket.gateway';
import { NotificationService } from './notification.service';
import { NotificationController } from './notification.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  User,
  ServiceRequest,
  ExpertMatchResult,
  Notification,
} from '../../database/entities';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, ServiceRequest, ExpertMatchResult, Notification]),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your-secret-key',
      signOptions: { expiresIn: process.env.JWT_EXPIRES_IN || '7d' },
    }),
  ],
  controllers: [NotificationController],
  providers: [WebSocketGateway, NotificationService],
  exports: [NotificationService],
})
export class WebSocketModule {}
