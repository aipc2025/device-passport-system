import { IsString, IsEnum, IsOptional, IsUUID, IsObject } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DeviceStatus, LifecycleEventType } from '@device-passport/shared';

export class CreateLifecycleEventDto {
  @ApiProperty()
  @IsUUID()
  passportId: string;

  @ApiProperty({ enum: LifecycleEventType })
  @IsEnum(LifecycleEventType)
  eventType: LifecycleEventType;

  @ApiPropertyOptional({ enum: DeviceStatus })
  @IsOptional()
  @IsEnum(DeviceStatus)
  previousStatus?: DeviceStatus;

  @ApiPropertyOptional({ enum: DeviceStatus })
  @IsOptional()
  @IsEnum(DeviceStatus)
  newStatus?: DeviceStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  previousLocation?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  newLocation?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  note?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;
}
