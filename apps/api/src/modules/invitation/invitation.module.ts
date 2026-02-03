import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InvitationController } from './invitation.controller';
import { InvitationService } from './invitation.service';
import { PointModule } from '../point/point.module';
import { InvitationCode, InvitationRecord, User } from '../../database/entities';

@Module({
  imports: [TypeOrmModule.forFeature([InvitationCode, InvitationRecord, User]), PointModule],
  controllers: [InvitationController],
  providers: [InvitationService],
  exports: [InvitationService],
})
export class InvitationModule {}
