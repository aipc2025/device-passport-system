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
  ArrayMinSize,
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

  // Expert types - supports multiple selection
  @ApiProperty({ enum: ExpertType, isArray: true })
  @IsArray()
  @ArrayMinSize(1, { message: 'At least one expert type must be selected' })
  @IsEnum(ExpertType, { each: true })
  expertTypes: ExpertType[];

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

  @ApiPropertyOptional({ description: 'ID/Passport document file ID' })
  @IsOptional()
  @IsUUID()
  idDocumentFileId?: string;

  @ApiPropertyOptional({ description: 'Profile photo file ID' })
  @IsOptional()
  @IsUUID()
  photoFileId?: string;
}
