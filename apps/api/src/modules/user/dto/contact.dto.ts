import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsEmail,
  IsBoolean,
  IsEnum,
} from 'class-validator';
import { ContactType, Gender } from '@device-passport/shared';

export class CreateContactDto {
  @ApiProperty({ enum: ContactType })
  @IsEnum(ContactType)
  contactType: ContactType;

  @ApiProperty()
  @IsString()
  name: string;

  @ApiPropertyOptional({ enum: Gender })
  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  mobile?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  position?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  department?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean;
}

export class UpdateContactDto extends PartialType(CreateContactDto) {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  personalNotes?: string;
}
