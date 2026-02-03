import { IsString, IsEnum, IsOptional, IsEmail, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ServiceType, ServicePriority } from '@device-passport/shared';

export class CreateServiceOrderDto {
  @ApiProperty({ example: 'DP-MED-2025-PLC-DE-000001-A7' })
  @IsString()
  passportCode: string;

  @ApiProperty({ enum: ServiceType, example: ServiceType.REPAIR })
  @IsEnum(ServiceType)
  serviceType: ServiceType;

  @ApiProperty({ enum: ServicePriority, example: ServicePriority.MEDIUM })
  @IsEnum(ServicePriority)
  priority: ServicePriority;

  @ApiProperty({ example: 'PLC Communication Error' })
  @IsString()
  title: string;

  @ApiProperty({ example: 'Device is not communicating with the network' })
  @IsString()
  description: string;

  @ApiProperty({ example: 'John Smith' })
  @IsString()
  contactName: string;

  @ApiProperty({ example: '+1-555-1234' })
  @IsString()
  contactPhone: string;

  @ApiPropertyOptional({ example: 'john@example.com' })
  @IsOptional()
  @IsEmail()
  contactEmail?: string;

  @ApiProperty({ example: '123 Industrial Ave, Building A' })
  @IsString()
  serviceAddress: string;

  @ApiPropertyOptional({ example: 'New York' })
  @IsOptional()
  @IsString()
  serviceCity?: string;

  @ApiPropertyOptional({ example: 'USA' })
  @IsOptional()
  @IsString()
  serviceCountry?: string;

  @ApiPropertyOptional({ example: '2025-02-01' })
  @IsOptional()
  @IsDateString()
  requestedDate?: string;

  @ApiPropertyOptional({ example: 'Please call before arriving' })
  @IsOptional()
  @IsString()
  customerNotes?: string;
}
