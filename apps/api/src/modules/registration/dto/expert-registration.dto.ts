import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsEmail,
  IsOptional,
  IsNumber,
  IsEnum,
  IsArray,
  IsUUID,
  MinLength,
} from 'class-validator';
import { ExpertType } from '@device-passport/shared';

export class ExpertRegistrationDto {
  // User info
  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsString()
  @MinLength(8)
  password: string;

  // Expert type
  @ApiProperty({ enum: ExpertType })
  @IsEnum(ExpertType)
  expertType: ExpertType;

  // Personal Info (Section F)
  @ApiProperty()
  @IsString()
  personalName: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  idNumber?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  dateOfBirth?: string;

  // Emergency Contact
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  emergencyContactName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  emergencyContactPhone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  emergencyContactRelationship?: string;

  // Professional Info
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  professionalField?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  servicesOffered?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  yearsOfExperience?: number;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  certifications?: string[];

  // Location
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  currentLocation?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  locationLat?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  locationLng?: number;

  // File uploads
  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  resumeFileId?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  certificateFileIds?: string[];
}
