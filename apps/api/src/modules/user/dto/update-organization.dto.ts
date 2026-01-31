import { IsString, IsOptional, IsBoolean, IsEmail, IsUrl, ValidateIf } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateOrganizationDto {
  @ApiPropertyOptional({ example: 'Acme Corporation' })
  @IsOptional()
  @IsString()
  name?: string;

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

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
