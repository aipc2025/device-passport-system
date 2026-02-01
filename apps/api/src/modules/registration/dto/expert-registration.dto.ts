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
  IsBoolean,
  ValidateNested,
  IsDateString,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ExpertType, IndustryCode, SkillCode } from '@device-passport/shared';

// Work history entry DTO
export class WorkHistoryDto {
  @ApiProperty()
  @IsString()
  companyName: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEmail()
  companyContactEmail?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  companyContactPhone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  companyAddress?: string;

  @ApiProperty()
  @IsString()
  position: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty()
  @IsDateString()
  startDate: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isCurrent?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;
}

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

  // Industries - for expert passport code
  @ApiPropertyOptional({ enum: IndustryCode, isArray: true })
  @IsOptional()
  @IsArray()
  @IsEnum(IndustryCode, { each: true })
  industries?: IndustryCode[];

  // Skills - for expert passport code
  @ApiPropertyOptional({ enum: SkillCode, isArray: true })
  @IsOptional()
  @IsArray()
  @IsEnum(SkillCode, { each: true })
  skills?: SkillCode[];

  // Nationality (ISO 3166-1 Alpha-2 code)
  @ApiPropertyOptional({ description: 'Nationality ISO Alpha-2 code (e.g., CN, US)' })
  @IsOptional()
  @IsString()
  nationality?: string;

  // Work history
  @ApiPropertyOptional({ type: [WorkHistoryDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WorkHistoryDto)
  workHistory?: WorkHistoryDto[];

  // Profile visibility
  @ApiPropertyOptional({ description: 'Whether profile is publicly visible' })
  @IsOptional()
  @IsBoolean()
  isProfilePublic?: boolean;
}
