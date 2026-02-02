import { IsString, Matches, MaxLength, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ScanCodeDto {
  @ApiProperty({
    example: 'DP-MED-2025-PLC-DE-000001-A7',
    description: 'Device passport code (format: DP-XXX-YYYY-XXX-XX-NNNNNN-CC)',
    minLength: 10,
    maxLength: 50,
  })
  @IsString()
  @MinLength(10, { message: 'Code must be at least 10 characters long' })
  @MaxLength(50, { message: 'Code must not exceed 50 characters' })
  @Matches(/^[A-Z0-9-]+$/, {
    message: 'Code must contain only uppercase letters, numbers, and hyphens',
  })
  code: string;
}

export class ExpertScanCodeDto {
  @ApiProperty({
    example: 'EP-TECH-2501-000001-A7',
    description: 'Expert passport code (format: EP-XXXX-YYMM-NNNNNN-CC)',
    minLength: 10,
    maxLength: 50,
  })
  @IsString()
  @MinLength(10, { message: 'Code must be at least 10 characters long' })
  @MaxLength(50, { message: 'Code must not exceed 50 characters' })
  @Matches(/^[A-Z0-9-]+$/, {
    message: 'Code must contain only uppercase letters, numbers, and hyphens',
  })
  code: string;
}
