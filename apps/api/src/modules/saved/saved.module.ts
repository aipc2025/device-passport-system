import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SavedController } from './saved.controller';
import { SavedService } from './saved.service';
import {
  SavedItem,
  Organization,
  MarketplaceProduct,
  BuyerRequirement,
} from '../../database/entities';

@Module({
  imports: [
    TypeOrmModule.forFeature([SavedItem, Organization, MarketplaceProduct, BuyerRequirement]),
  ],
  controllers: [SavedController],
  providers: [SavedService],
  exports: [SavedService],
})
export class SavedModule {}
