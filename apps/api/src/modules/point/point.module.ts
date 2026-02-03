import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PointController, PointRuleAdminController } from './point.controller';
import { PointService } from './point.service';
import { PointAccount, PointTransaction, PointRule, User } from '../../database/entities';

@Module({
  imports: [TypeOrmModule.forFeature([PointAccount, PointTransaction, PointRule, User])],
  controllers: [PointController, PointRuleAdminController],
  providers: [PointService],
  exports: [PointService],
})
export class PointModule {}
