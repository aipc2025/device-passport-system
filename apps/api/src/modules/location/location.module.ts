import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LocationController } from './location.controller';
import { LocationService } from './location.service';
import {
  IndividualExpert,
  ServiceRequest,
  DevicePassport,
} from '../../database/entities';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      IndividualExpert,
      ServiceRequest,
      DevicePassport,
    ]),
  ],
  controllers: [LocationController],
  providers: [LocationService],
  exports: [LocationService],
})
export class LocationModule {}
