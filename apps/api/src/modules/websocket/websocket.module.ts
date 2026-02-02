import { Module } from '@nestjs/common';
import { WebSocketGateway } from './websocket.gateway';
import { NotificationService } from './notification.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { ServiceRequest } from '../entities/service-request.entity';
import { ExpertMatchResult } from '../entities/expert-match-result.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, ServiceRequest, ExpertMatchResult])],
  providers: [WebSocketGateway, NotificationService],
  exports: [NotificationService],
})
export class WebSocketModule {}
