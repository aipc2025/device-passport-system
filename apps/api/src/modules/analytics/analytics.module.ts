import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';
import { DevicePassport } from '../entities/device-passport.entity';
import { LifecycleEvent } from '../entities/lifecycle-event.entity';
import { ServiceOrder } from '../entities/service-order.entity';
import { ServiceRequest } from '../entities/service-request.entity';
import { IndividualExpert } from '../entities/individual-expert.entity';

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
