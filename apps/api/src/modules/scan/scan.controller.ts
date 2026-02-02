import { Controller, Get, Param, ValidationPipe, UsePipes } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { ScanService } from './scan.service';
import { Public } from '../../common/decorators';

@ApiTags('scan')
@Controller('scan')
export class ScanController {
  constructor(private readonly scanService: ScanService) {}

  // ==========================================
  // Device Passport Scanning
  // ==========================================

  @Get('device/:code')
  @Public()
  @Throttle({ short: { limit: 5, ttl: 1000 } }) // Max 5 requests per second
  @Throttle({ medium: { limit: 20, ttl: 60000 } }) // Max 20 requests per minute
  @ApiOperation({ summary: 'Get public device info by scanning passport code (no auth required)' })
  @ApiParam({
    name: 'code',
    description: 'Device passport code',
    example: 'DP-MED-2025-PLC-DE-000001-A7',
  })
  async getDevicePublicInfo(@Param('code') code: string) {
    // Validate and sanitize input
    const sanitizedCode = code.trim().toUpperCase();
    return this.scanService.getPublicInfo(sanitizedCode);
  }

  @Get('device/:code/validate')
  @Public()
  @Throttle({ short: { limit: 10, ttl: 1000 } }) // Max 10 requests per second (validation is lightweight)
  @Throttle({ medium: { limit: 50, ttl: 60000 } }) // Max 50 requests per minute
  @ApiOperation({ summary: 'Validate device passport code format (no auth required)' })
  @ApiParam({
    name: 'code',
    description: 'Device passport code to validate',
    example: 'DP-MED-2025-PLC-DE-000001-A7',
  })
  async validateDeviceCode(@Param('code') code: string) {
    const sanitizedCode = code.trim().toUpperCase();
    return this.scanService.validateCode(sanitizedCode);
  }

  // ==========================================
  // Expert Passport Scanning
  // ==========================================

  @Get('expert/:code')
  @Public()
  @Throttle({ short: { limit: 5, ttl: 1000 } }) // Max 5 requests per second
  @Throttle({ medium: { limit: 20, ttl: 60000 } }) // Max 20 requests per minute
  @ApiOperation({ summary: 'Get public expert info by scanning passport code (no auth required)' })
  @ApiParam({
    name: 'code',
    description: 'Expert passport code',
    example: 'EP-TECH-2501-000001-A7',
  })
  async getExpertPublicInfo(@Param('code') code: string) {
    const sanitizedCode = code.trim().toUpperCase();
    return this.scanService.getExpertPublicInfo(sanitizedCode);
  }

  @Get('expert/:code/validate')
  @Public()
  @Throttle({ short: { limit: 10, ttl: 1000 } }) // Max 10 requests per second
  @Throttle({ medium: { limit: 50, ttl: 60000 } }) // Max 50 requests per minute
  @ApiOperation({ summary: 'Validate expert passport code format (no auth required)' })
  @ApiParam({
    name: 'code',
    description: 'Expert passport code to validate',
    example: 'EP-TECH-2501-000001-A7',
  })
  async validateExpertCode(@Param('code') code: string) {
    const sanitizedCode = code.trim().toUpperCase();
    return this.scanService.validateExpertCode(sanitizedCode);
  }

  // ==========================================
  // Legacy endpoint (backward compatibility)
  // ==========================================

  @Get(':code')
  @Public()
  @Throttle({ short: { limit: 5, ttl: 1000 } }) // Max 5 requests per second
  @Throttle({ medium: { limit: 20, ttl: 60000 } }) // Max 20 requests per minute
  @ApiOperation({ summary: 'Get public device info by scanning passport code (legacy, no auth required)' })
  @ApiParam({
    name: 'code',
    description: 'Device passport code',
    example: 'DP-MED-2025-PLC-DE-000001-A7',
  })
  async getPublicInfo(@Param('code') code: string) {
    const sanitizedCode = code.trim().toUpperCase();
    return this.scanService.getPublicInfo(sanitizedCode);
  }

  @Get(':code/validate')
  @Public()
  @Throttle({ short: { limit: 10, ttl: 1000 } }) // Max 10 requests per second
  @Throttle({ medium: { limit: 50, ttl: 60000 } }) // Max 50 requests per minute
  @ApiOperation({ summary: 'Validate passport code format (legacy, no auth required)' })
  @ApiParam({
    name: 'code',
    description: 'Device passport code to validate',
    example: 'DP-MED-2025-PLC-DE-000001-A7',
  })
  async validateCode(@Param('code') code: string) {
    const sanitizedCode = code.trim().toUpperCase();
    return this.scanService.validateCode(sanitizedCode);
  }
}
