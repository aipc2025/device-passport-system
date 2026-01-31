import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsNumber,
  IsEnum,
  IsDateString,
  Min,
  MaxLength,
} from 'class-validator';
import { InquiryMessageType } from '@device-passport/shared';

export class CreateMessageDto {
  @ApiProperty({ enum: InquiryMessageType, description: 'Message type' })
  @IsEnum(InquiryMessageType)
  messageType: InquiryMessageType;

  @ApiPropertyOptional({ description: 'Message content' })
  @IsOptional()
  @IsString()
  content?: string;

  // Quote fields (for QUOTE or COUNTER_OFFER types)
  @ApiPropertyOptional({ description: 'Quote price' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  quotePrice?: number;

  @ApiPropertyOptional({ description: 'Quote currency (3-letter code)' })
  @IsOptional()
  @IsString()
  @MaxLength(3)
  quoteCurrency?: string;

  @ApiPropertyOptional({ description: 'Quote validity date' })
  @IsOptional()
  @IsDateString()
  quoteValidUntil?: string;

  @ApiPropertyOptional({ description: 'Quoted lead time in days' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  quotedLeadTimeDays?: number;
}
