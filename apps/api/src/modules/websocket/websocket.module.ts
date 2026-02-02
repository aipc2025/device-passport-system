import { Module } from '@nestjs/common';
import { WebSocketGateway } from './websocket.gateway';
import { NotificationService } from './notification.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  User,
  ServiceRequest,
  ExpertMatchResult,
} from '../../database/entities';

@Module({
  imports: [TypeOrmModule.forFeature([User, ServiceRequest, ExpertMatchResult])],
  providers: [WebSocketGateway, NotificationService],
  exports: [NotificationService],
})
export class WebSocketModule {}
