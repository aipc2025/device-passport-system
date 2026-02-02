import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { WebSocketGateway } from './websocket.gateway';
import { NotificationService } from './notification.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  User,
  ServiceRequest,
  ExpertMatchResult,
} from '../../database/entities';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, ServiceRequest, ExpertMatchResult]),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your-secret-key',
      signOptions: { expiresIn: process.env.JWT_EXPIRES_IN || '7d' },
    }),
  ],
  providers: [WebSocketGateway, NotificationService],
  exports: [NotificationService],
})
export class WebSocketModule {}
