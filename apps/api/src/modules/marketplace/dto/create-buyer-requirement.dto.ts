import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsNumber,
  IsEnum,
  IsBoolean,
  IsDateString,
  IsArray,
  MaxLength,
  Min,
} from 'class-validator';
import { ProductLine, PurchaseFrequency, RFQStatus } from '@device-passport/shared';

export class CreateBuyerRequirementDto {
  @ApiProperty({ description: 'RFQ title' })
  @IsString()
  @MaxLength(200)
  title: string;

  @ApiPropertyOptional({ description: 'Requirement description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ enum: ProductLine, description: 'Product category' })
  @IsOptional()
  @IsEnum(ProductLine)
  productCategory?: ProductLine;

  @ApiPropertyOptional({ description: 'HS Code' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  hsCode?: string;

  @ApiPropertyOptional({ description: 'Required quantity' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  quantity?: number;

  @ApiPropertyOptional({ description: 'Quantity unit (units, sets, kg, etc.)' })
  @IsOptional()
  @IsString()
  quantityUnit?: string;

  @ApiPropertyOptional({ enum: PurchaseFrequency, description: 'Purchase frequency' })
  @IsOptional()
  @IsEnum(PurchaseFrequency)
  purchaseFrequency?: PurchaseFrequency;

  @ApiPropertyOptional({ description: 'Minimum budget' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  budgetMin?: number;

  @ApiPropertyOptional({ description: 'Maximum budget' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  budgetMax?: number;

  @ApiPropertyOptional({ description: 'Budget currency (3-letter code)', default: 'USD' })
  @IsOptional()
  @IsString()
  @MaxLength(3)
  budgetCurrency?: string;

  @ApiPropertyOptional({ description: 'Preferred supply regions', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  preferredRegions?: string[];

  @ApiPropertyOptional({ description: 'Buyer location latitude' })
  @IsOptional()
  @IsNumber()
  buyerLocationLat?: number;

  @ApiPropertyOptional({ description: 'Buyer location longitude' })
  @IsOptional()
  @IsNumber()
  buyerLocationLng?: number;

  @ApiPropertyOptional({ description: 'Delivery deadline' })
  @IsOptional()
  @IsDateString()
  deliveryDeadline?: string;

  @ApiPropertyOptional({ description: 'Valid until date' })
  @IsOptional()
  @IsDateString()
  validUntil?: string;

  @ApiPropertyOptional({ description: 'Make RFQ public', default: true })
  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;

  @ApiPropertyOptional({ description: 'Show company info', default: true })
  @IsOptional()
  @IsBoolean()
  showCompanyInfo?: boolean;

  @ApiPropertyOptional({ enum: RFQStatus, description: 'RFQ status' })
  @IsOptional()
  @IsEnum(RFQStatus)
  status?: RFQStatus;
}
