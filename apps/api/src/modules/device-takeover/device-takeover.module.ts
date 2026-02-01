import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  DeviceTakeoverController,
  DeviceTakeoverExpertController,
  DeviceTakeoverAdminController,
} from './device-takeover.controller';
import { DeviceTakeoverService } from './device-takeover.service';
import { PointModule } from '../point/point.module';
import {
  DeviceTakeoverRequest,
  DevicePassport,
  SequenceCounter,
} from '../../database/entities';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      DeviceTakeoverRequest,
      DevicePassport,
      SequenceCounter,
    ]),
    PointModule,
  ],
  controllers: [
    DeviceTakeoverController,
    DeviceTakeoverExpertController,
    DeviceTakeoverAdminController,
  ],
  providers: [DeviceTakeoverService],
  exports: [DeviceTakeoverService],
})
export class DeviceTakeoverModule {}
