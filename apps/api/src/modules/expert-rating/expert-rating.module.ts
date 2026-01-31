import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  ExpertServiceRecord,
  ExpertReview,
  IndividualExpert,
  ServiceRequest,
} from '../../database/entities';
import { ExpertRatingService } from './expert-rating.service';
import { ExpertRatingController } from './expert-rating.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ExpertServiceRecord,
      ExpertReview,
      IndividualExpert,
      ServiceRequest,
    ]),
  ],
  controllers: [ExpertRatingController],
  providers: [ExpertRatingService],
  exports: [ExpertRatingService],
})
export class ExpertRatingModule {}
