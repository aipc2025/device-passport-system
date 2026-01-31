import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { SavedItemType } from '@device-passport/shared';

export class CreateSavedItemDto {
  @ApiProperty({ enum: SavedItemType, description: 'Type of item to save' })
  @IsEnum(SavedItemType)
  itemType: SavedItemType;

  @ApiProperty({ description: 'ID of the item to save' })
  @IsUUID()
  itemId: string;

  @ApiPropertyOptional({ description: 'Optional notes about the saved item' })
  @IsOptional()
  @IsString()
  notes?: string;
}
