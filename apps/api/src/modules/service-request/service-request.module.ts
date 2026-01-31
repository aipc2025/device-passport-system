import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServiceRequestController } from './service-request.controller';
import { ServiceRequestService } from './service-request.service';
import {
  ServiceRequest,
  ExpertApplication,
  IndividualExpert,
  ExpertMatchResult,
} from '../../database/entities';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ServiceRequest,
      ExpertApplication,
      IndividualExpert,
      ExpertMatchResult,
    ]),
  ],
  controllers: [ServiceRequestController],
  providers: [ServiceRequestService],
  exports: [ServiceRequestService],
})
export class ServiceRequestModule {}
