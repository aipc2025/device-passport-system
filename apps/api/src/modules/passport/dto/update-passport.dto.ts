import { IsString, IsOptional, IsUUID, IsDateString, IsObject } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdatePassportDto {
  @ApiPropertyOptional({ example: 'Siemens S7-1500 PLC Updated' })
  @IsOptional()
  @IsString()
  deviceName?: string;

  @ApiPropertyOptional({ example: 'S7-1500-F' })
  @IsOptional()
  @IsString()
  deviceModel?: string;

  @ApiPropertyOptional({
    example: { voltage: '24V DC', memory: '200KB' },
  })
  @IsOptional()
  @IsObject()
  specifications?: Record<string, unknown>;

  @ApiPropertyOptional({ example: '2028-01-15' })
  @IsOptional()
  @IsDateString()
  warrantyExpiryDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  customerId?: string;

  @ApiPropertyOptional({ example: 'Customer Site - Building A' })
  @IsOptional()
  @IsString()
  currentLocation?: string;
}
