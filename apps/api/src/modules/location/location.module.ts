import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LocationController } from './location.controller';
import { LocationService } from './location.service';
import { IndividualExpert } from '../entities/individual-expert.entity';
import { ServiceRequest } from '../entities/service-request.entity';
import { DevicePassport } from '../entities/device-passport.entity';

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
