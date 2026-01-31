import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsNumber,
  IsUUID,
  IsDateString,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateInquiryDto {
  @ApiPropertyOptional({ description: 'Related marketplace product ID' })
  @IsOptional()
  @IsUUID()
  marketplaceProductId?: string;

  @ApiPropertyOptional({ description: 'Related buyer requirement ID' })
  @IsOptional()
  @IsUUID()
  buyerRequirementId?: string;

  @ApiPropertyOptional({ description: 'Related match result ID' })
  @IsOptional()
  @IsUUID()
  matchResultId?: string;

  @ApiProperty({ description: 'Supplier organization ID' })
  @IsUUID()
  supplierOrgId: string;

  @ApiProperty({ description: 'Inquiry subject' })
  @IsString()
  @MaxLength(200)
  subject: string;

  @ApiPropertyOptional({ description: 'Initial message' })
  @IsOptional()
  @IsString()
  message?: string;

  @ApiPropertyOptional({ description: 'Requested quantity' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  quantity?: number;

  @ApiPropertyOptional({ description: 'Target price' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  targetPrice?: number;

  @ApiPropertyOptional({ description: 'Target currency (3-letter code)', default: 'USD' })
  @IsOptional()
  @IsString()
  @MaxLength(3)
  targetCurrency?: string;

  @ApiPropertyOptional({ description: 'Required delivery date' })
  @IsOptional()
  @IsDateString()
  requiredDeliveryDate?: string;
}
