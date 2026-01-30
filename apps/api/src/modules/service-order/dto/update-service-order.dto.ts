import { IsString, IsEnum, IsOptional, IsUUID, IsDateString, IsInt, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { ServiceOrderStatus, ServicePriority } from '@device-passport/shared';

export class UpdateServiceOrderDto {
  @ApiPropertyOptional({ enum: ServiceOrderStatus })
  @IsOptional()
  @IsEnum(ServiceOrderStatus)
  status?: ServiceOrderStatus;

  @ApiPropertyOptional({ enum: ServicePriority })
  @IsOptional()
  @IsEnum(ServicePriority)
  priority?: ServicePriority;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  assignedEngineerId?: string;

  @ApiPropertyOptional({ example: '2025-02-05' })
  @IsOptional()
  @IsDateString()
  scheduledDate?: string;

  @ApiPropertyOptional({ example: 4, description: 'Estimated duration in hours' })
  @IsOptional()
  @IsInt()
  @Min(1)
  estimatedDuration?: number;

  @ApiPropertyOptional({ example: 'Engineer notes here' })
  @IsOptional()
  @IsString()
  internalNotes?: string;

  @ApiPropertyOptional({ example: 'Issue resolved by replacing communication module' })
  @IsOptional()
  @IsString()
  resolutionNotes?: string;
}
