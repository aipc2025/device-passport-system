import { IsString, IsOptional, IsBoolean, IsNumber, MaxLength, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateProductTypeDto {
  @ApiProperty({ example: 'PKG', description: 'Unique code for product type (2-10 chars)' })
  @IsString()
  @MinLength(2)
  @MaxLength(10)
  code: string;

  @ApiProperty({ example: 'Packaging Filling', description: 'Display name for product type' })
  @IsString()
  @MaxLength(100)
  name: string;

  @ApiPropertyOptional({ example: 'Automated packaging and filling solutions' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: true, default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ example: 0, description: 'Display order' })
  @IsOptional()
  @IsNumber()
  sortOrder?: number;
}
