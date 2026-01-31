import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InquiryController } from './inquiry.controller';
import { InquiryService } from './inquiry.service';
import {
  Inquiry,
  InquiryMessage,
  MarketplaceProduct,
  BuyerRequirement,
  Organization,
} from '../../database/entities';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Inquiry,
      InquiryMessage,
      MarketplaceProduct,
      BuyerRequirement,
      Organization,
    ]),
  ],
  controllers: [InquiryController],
  providers: [InquiryService],
  exports: [InquiryService],
})
export class InquiryModule {}
