import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExpertController, ExpertPassportPublicController } from './expert.controller';
import { ExpertService } from './expert.service';
import { ExpertCodeService } from './expert-code.service';
import {
  IndividualExpert,
  ServiceOrder,
  ExpertSequenceCounter,
  ExpertMatchResult,
  ExpertServiceRecord,
  ExpertApplication,
  ExpertPassportSequence,
  ExpertWorkHistory,
} from '../../database/entities';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      IndividualExpert,
      ServiceOrder,
      ExpertSequenceCounter,
      ExpertMatchResult,
      ExpertServiceRecord,
      ExpertApplication,
      ExpertPassportSequence,
      ExpertWorkHistory,
    ]),
  ],
  controllers: [ExpertController, ExpertPassportPublicController],
  providers: [ExpertService, ExpertCodeService],
  exports: [ExpertService, ExpertCodeService],
})
export class ExpertModule {}
