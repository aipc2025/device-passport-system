import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum } from 'class-validator';
import { RegistrationStatus } from '@device-passport/shared';

export class UpdateRegistrationStatusDto {
  @ApiProperty({ enum: RegistrationStatus })
  @IsEnum(RegistrationStatus)
  status: RegistrationStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  adminNotes?: string;
}
