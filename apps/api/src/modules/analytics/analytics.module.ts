import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';
import {
  DevicePassport,
  LifecycleEvent,
  ServiceOrder,
  ServiceRequest,
  IndividualExpert,
} from '../../database/entities';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      DevicePassport,
      LifecycleEvent,
      ServiceOrder,
      ServiceRequest,
      IndividualExpert,
    ]),
  ],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}
