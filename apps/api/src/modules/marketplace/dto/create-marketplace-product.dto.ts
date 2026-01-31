import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsNumber,
  IsEnum,
  IsBoolean,
  IsDateString,
  MaxLength,
  Min,
  IsUUID,
} from 'class-validator';
import { ProductLine, MarketplaceListingStatus } from '@device-passport/shared';

export class CreateMarketplaceProductDto {
  @ApiPropertyOptional({ description: 'Link to existing supplier product' })
  @IsOptional()
  @IsUUID()
  supplierProductId?: string;

  @ApiProperty({ description: 'Listing title' })
  @IsString()
  @MaxLength(200)
  listingTitle: string;

  @ApiPropertyOptional({ description: 'Product description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'HS Code' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  hsCode?: string;

  @ApiPropertyOptional({ enum: ProductLine, description: 'Product category' })
  @IsOptional()
  @IsEnum(ProductLine)
  productCategory?: ProductLine;

  @ApiPropertyOptional({ description: 'Show price publicly', default: true })
  @IsOptional()
  @IsBoolean()
  showPrice?: boolean;

  @ApiPropertyOptional({ description: 'Minimum price' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  minPrice?: number;

  @ApiPropertyOptional({ description: 'Maximum price' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  maxPrice?: number;

  @ApiPropertyOptional({ description: 'Price currency (3-letter code)', default: 'USD' })
  @IsOptional()
  @IsString()
  @MaxLength(3)
  priceCurrency?: string;

  @ApiPropertyOptional({ description: 'Price unit (per unit, per set, etc.)' })
  @IsOptional()
  @IsString()
  priceUnit?: string;

  @ApiPropertyOptional({ description: 'Minimum order quantity' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  minOrderQuantity?: number;

  @ApiPropertyOptional({ description: 'Supply region (country code or region name)' })
  @IsOptional()
  @IsString()
  supplyRegion?: string;

  @ApiPropertyOptional({ description: 'Location latitude' })
  @IsOptional()
  @IsNumber()
  locationLat?: number;

  @ApiPropertyOptional({ description: 'Location longitude' })
  @IsOptional()
  @IsNumber()
  locationLng?: number;

  @ApiPropertyOptional({ description: 'Lead time in days' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  leadTimeDays?: number;

  @ApiPropertyOptional({ description: 'Shipping terms (FOB, CIF, etc.)' })
  @IsOptional()
  shippingTerms?: Record<string, unknown>;

  @ApiPropertyOptional({ enum: MarketplaceListingStatus, description: 'Listing status' })
  @IsOptional()
  @IsEnum(MarketplaceListingStatus)
  status?: MarketplaceListingStatus;

  @ApiPropertyOptional({ description: 'Expiration date' })
  @IsOptional()
  @IsDateString()
  expiresAt?: string;
}
