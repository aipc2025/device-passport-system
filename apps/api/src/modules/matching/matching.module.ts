import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MatchingController } from './matching.controller';
import { MatchingService } from './matching.service';
import {
  MatchResult,
  MarketplaceProduct,
  BuyerRequirement,
  Organization,
} from '../../database/entities';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      MatchResult,
      MarketplaceProduct,
      BuyerRequirement,
      Organization,
    ]),
  ],
  controllers: [MatchingController],
  providers: [MatchingService],
  exports: [MatchingService],
})
export class MatchingModule {}
