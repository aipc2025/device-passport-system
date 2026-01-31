import {
  IsString,
  IsEnum,
  IsOptional,
  IsUUID,
  IsDateString,
  IsObject,
  IsNumber,
  IsEmail,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ProductLine, OriginCode } from '@device-passport/shared';

export class CreatePassportDto {
  @ApiProperty({ enum: ProductLine, example: ProductLine.PF })
  @IsEnum(ProductLine)
  productLine: ProductLine;

  @ApiProperty({ enum: OriginCode, example: OriginCode.DE })
  @IsEnum(OriginCode)
  originCode: OriginCode;

  @ApiPropertyOptional({ example: 'TH', description: 'Custom origin code when originCode is OTHER' })
  @IsOptional()
  @IsString()
  customOriginCode?: string;

  @ApiProperty({ example: 'Automated Packaging Line' })
  @IsString()
  deviceName: string;

  @ApiProperty({ example: 'PKG-2000' })
  @IsString()
  deviceModel: string;

  @ApiProperty({ example: 'LUNA INDUSTRY' })
  @IsString()
  manufacturer: string;

  @ApiPropertyOptional({ example: '6ES7511-1AK02-0AB0' })
  @IsOptional()
  @IsString()
  manufacturerPartNumber?: string;

  @ApiPropertyOptional({ example: 'SN-123456789' })
  @IsOptional()
  @IsString()
  serialNumber?: string;

  @ApiPropertyOptional({
    example: { voltage: '24V DC', memory: '150KB' },
    description: 'Device specifications',
  })
  @IsOptional()
  @IsObject()
  specifications?: Record<string, unknown>;

  @ApiPropertyOptional({ example: '2025-01-15' })
  @IsOptional()
  @IsDateString()
  manufactureDate?: string;

  @ApiPropertyOptional({ example: '2027-01-15' })
  @IsOptional()
  @IsDateString()
  warrantyExpiryDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  supplierId?: string;

  @ApiPropertyOptional({ example: 'Warehouse A, Shelf 12' })
  @IsOptional()
  @IsString()
  currentLocation?: string;

  @ApiPropertyOptional({ example: 21.0285, description: 'Location latitude' })
  @IsOptional()
  @IsNumber()
  locationLat?: number;

  @ApiPropertyOptional({ example: 105.8542, description: 'Location longitude' })
  @IsOptional()
  @IsNumber()
  locationLng?: number;

  // Buyer information fields
  @ApiPropertyOptional({ example: 'ABC Manufacturing Co.' })
  @IsOptional()
  @IsString()
  buyerCompany?: string;

  @ApiPropertyOptional({ example: 'John Smith' })
  @IsOptional()
  @IsString()
  buyerContact?: string;

  @ApiPropertyOptional({ example: '+1-555-123-4567' })
  @IsOptional()
  @IsString()
  buyerPhone?: string;

  @ApiPropertyOptional({ example: 'US' })
  @IsOptional()
  @IsString()
  buyerCountry?: string;

  @ApiPropertyOptional({ example: '123 Industrial Blvd, City, State 12345' })
  @IsOptional()
  @IsString()
  buyerAddress?: string;

  @ApiPropertyOptional({ example: 40.7128, description: 'Buyer address latitude' })
  @IsOptional()
  @IsNumber()
  buyerAddressLat?: number;

  @ApiPropertyOptional({ example: -74.0060, description: 'Buyer address longitude' })
  @IsOptional()
  @IsNumber()
  buyerAddressLng?: number;

  @ApiPropertyOptional({ example: 'john.smith@abcmfg.com' })
  @IsOptional()
  @IsEmail()
  buyerEmail?: string;
}
