import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MarketplaceController } from './marketplace.controller';
import { MarketplaceService } from './marketplace.service';
import {
  MarketplaceProduct,
  BuyerRequirement,
  Organization,
  SupplierProduct,
} from '../../database/entities';

@Module({
  imports: [
    TypeOrmModule.forFeature([MarketplaceProduct, BuyerRequirement, Organization, SupplierProduct]),
  ],
  controllers: [MarketplaceController],
  providers: [MarketplaceService],
  exports: [MarketplaceService],
})
export class MarketplaceModule {}
