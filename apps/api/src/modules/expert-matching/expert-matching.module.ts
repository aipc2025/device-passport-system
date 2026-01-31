import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExpertMatchingController } from './expert-matching.controller';
import { ExpertMatchingService } from './expert-matching.service';
import {
  ServiceRequest,
  IndividualExpert,
  ExpertMatchResult,
} from '../../database/entities';

@Module({
  imports: [
    TypeOrmModule.forFeature([ServiceRequest, IndividualExpert, ExpertMatchResult]),
  ],
  controllers: [ExpertMatchingController],
  providers: [ExpertMatchingService],
  exports: [ExpertMatchingService],
})
export class ExpertMatchingModule {}
