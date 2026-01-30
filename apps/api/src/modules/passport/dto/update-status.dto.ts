import { IsString, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DeviceStatus } from '@device-passport/shared';

export class UpdateStatusDto {
  @ApiProperty({ enum: DeviceStatus, example: DeviceStatus.PROCURED })
  @IsEnum(DeviceStatus)
  status: DeviceStatus;

  @ApiPropertyOptional({ example: 'Passed incoming inspection' })
  @IsOptional()
  @IsString()
  note?: string;

  @ApiPropertyOptional({ example: 'QC Department' })
  @IsOptional()
  @IsString()
  location?: string;
}
