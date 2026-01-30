import {
  IsString,
  IsEnum,
  IsOptional,
  IsEmail,
  IsDateString,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ServiceType } from '@device-passport/shared';

export class PublicServiceRequestDto {
  @ApiProperty({ example: 'DP-MED-2025-PLC-DE-000001-A7' })
  @IsString()
  passportCode: string;

  @ApiProperty({ enum: ServiceType, example: ServiceType.REPAIR })
  @IsEnum(ServiceType)
  serviceType: ServiceType;

  @ApiProperty({ example: 'Device Malfunction' })
  @IsString()
  title: string;

  @ApiProperty({ example: 'The device stopped working suddenly' })
  @IsString()
  description: string;

  @ApiProperty({ example: 'John Smith' })
  @IsString()
  contactName: string;

  @ApiProperty({ example: '+1-555-1234' })
  @IsString()
  contactPhone: string;

  @ApiProperty({ example: 'john@example.com' })
  @IsEmail()
  contactEmail: string;

  @ApiProperty({ example: '123 Industrial Ave' })
  @IsString()
  serviceAddress: string;

  @ApiPropertyOptional({ example: 'New York' })
  @IsOptional()
  @IsString()
  serviceCity?: string;

  @ApiPropertyOptional({ example: '2025-02-10' })
  @IsOptional()
  @IsDateString()
  preferredDate?: string;
}
