import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsNumber,
  IsEnum,
  IsBoolean,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ProductLine } from '@device-passport/shared';

export class MarketplaceSearchDto {
  @ApiPropertyOptional({ description: 'Search keyword' })
  @IsOptional()
  @IsString()
  keyword?: string;

  @ApiPropertyOptional({ enum: ProductLine, description: 'Product category' })
  @IsOptional()
  @IsEnum(ProductLine)
  category?: ProductLine;

  @ApiPropertyOptional({ description: 'HS Code prefix' })
  @IsOptional()
  @IsString()
  hsCode?: string;

  @ApiPropertyOptional({ description: 'Minimum price' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  priceMin?: number;

  @ApiPropertyOptional({ description: 'Maximum price' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  priceMax?: number;

  @ApiPropertyOptional({ description: 'Supply/preferred region' })
  @IsOptional()
  @IsString()
  region?: string;

  @ApiPropertyOptional({ description: 'User latitude for distance calculation' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  userLat?: number;

  @ApiPropertyOptional({ description: 'User longitude for distance calculation' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  userLng?: number;

  @ApiPropertyOptional({ description: 'Maximum distance in km' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxDistanceKm?: number;

  @ApiPropertyOptional({ description: 'Sort by field', enum: ['createdAt', 'price', 'distance', 'viewCount'] })
  @IsOptional()
  @IsString()
  sortBy?: 'createdAt' | 'price' | 'distance' | 'viewCount';

  @ApiPropertyOptional({ description: 'Sort order', enum: ['ASC', 'DESC'] })
  @IsOptional()
  @IsEnum(['ASC', 'DESC'])
  sortOrder?: 'ASC' | 'DESC';

  @ApiPropertyOptional({ description: 'Page number', default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({ description: 'Items per page', default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number;

  @ApiPropertyOptional({ description: 'Include featured items first' })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  featuredFirst?: boolean;
}
