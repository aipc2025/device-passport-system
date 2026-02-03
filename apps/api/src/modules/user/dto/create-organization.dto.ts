import { IsString, IsOptional, IsEnum, Length, IsEmail, IsUrl, ValidateIf } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { OrganizationType } from '@device-passport/shared';

export class CreateOrganizationDto {
  @ApiProperty({ example: 'Acme Corporation' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'ACM', description: '3-letter company code' })
  @IsString()
  @Length(3, 3)
  code: string;

  @ApiProperty({ enum: OrganizationType, example: OrganizationType.SUPPLIER })
  @IsEnum(OrganizationType)
  type: OrganizationType;

  @ApiPropertyOptional({ example: '123 Main St' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({ example: 'New York' })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({ example: 'USA' })
  @IsOptional()
  @IsString()
  country?: string;

  @ApiPropertyOptional({ example: '+1-555-1234' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ example: 'contact@acme.com' })
  @IsOptional()
  @ValidateIf((o) => o.email !== '' && o.email !== null)
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ example: 'https://acme.com' })
  @IsOptional()
  @ValidateIf((o) => o.website !== '' && o.website !== null)
  @IsUrl()
  website?: string;

  @ApiPropertyOptional({ example: 'John Smith', description: 'Primary contact person' })
  @IsOptional()
  @IsString()
  contactPerson?: string;

  @ApiPropertyOptional({ example: 'Jane Doe', description: 'Backup contact person' })
  @IsOptional()
  @IsString()
  backupContact?: string;

  @ApiPropertyOptional({ example: '+1-555-5678', description: 'Backup contact phone' })
  @IsOptional()
  @IsString()
  backupPhone?: string;
}
