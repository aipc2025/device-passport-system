import {
  IsString,
  IsEnum,
  IsOptional,
  IsUUID,
  IsDateString,
  IsObject,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ProductLine, OriginCode } from '@device-passport/shared';

export class CreatePassportDto {
  @ApiProperty({ enum: ProductLine, example: ProductLine.PLC })
  @IsEnum(ProductLine)
  productLine: ProductLine;

  @ApiProperty({ enum: OriginCode, example: OriginCode.DE })
  @IsEnum(OriginCode)
  originCode: OriginCode;

  @ApiProperty({ example: 'Siemens S7-1500 PLC' })
  @IsString()
  deviceName: string;

  @ApiProperty({ example: 'S7-1500' })
  @IsString()
  deviceModel: string;

  @ApiProperty({ example: 'Siemens' })
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
}
