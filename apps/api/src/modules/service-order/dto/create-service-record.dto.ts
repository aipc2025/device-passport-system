import {
  IsString,
  IsEnum,
  IsOptional,
  IsUUID,
  IsDateString,
  IsInt,
  Min,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ServiceRecordType, ServicePart } from '@device-passport/shared';

export class ServicePartDto implements ServicePart {
  @ApiProperty({ example: 'COM-MOD-001' })
  @IsString()
  partNumber: string;

  @ApiProperty({ example: 'Communication Module' })
  @IsString()
  partName: string;

  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(1)
  quantity: number;

  @ApiPropertyOptional({ example: 250.0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  unitPrice?: number;
}

export class CreateServiceRecordDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  serviceOrderId?: string;

  @ApiProperty({ example: 'Replaced communication module and reconfigured network settings' })
  @IsString()
  workPerformed: string;

  @ApiPropertyOptional({ type: [ServicePartDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ServicePartDto)
  partsUsed?: ServicePartDto[];

  @ApiProperty({ example: '2025-02-05T09:00:00Z' })
  @IsDateString()
  startTime: string;

  @ApiProperty({ example: '2025-02-05T12:30:00Z' })
  @IsDateString()
  endTime: string;

  @ApiPropertyOptional({ example: 30, description: 'Travel time in minutes' })
  @IsOptional()
  @IsInt()
  @Min(0)
  travelTime?: number;

  @ApiProperty({ enum: ServiceRecordType, example: ServiceRecordType.REPAIR })
  @IsEnum(ServiceRecordType)
  recordType: ServiceRecordType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  engineerSignature?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  customerSignature?: string;
}
