import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { InquiryStatus } from '@device-passport/shared';

export class UpdateInquiryStatusDto {
  @ApiProperty({ enum: InquiryStatus, description: 'New status' })
  @IsEnum(InquiryStatus)
  status: InquiryStatus;

  @ApiPropertyOptional({ description: 'Reason for closing/rejecting' })
  @IsOptional()
  @IsString()
  closeReason?: string;
}
