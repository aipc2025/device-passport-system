import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam } from '@nestjs/swagger';
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
  @ApiOperation({ summary: 'Get public device info by scanning passport code (no auth required)' })
  @ApiParam({
    name: 'code',
    description: 'Device passport code',
    example: 'DP-MED-2025-PLC-DE-000001-A7',
  })
  async getDevicePublicInfo(@Param('code') code: string) {
    return this.scanService.getPublicInfo(code);
  }

  @Get('device/:code/validate')
  @Public()
  @ApiOperation({ summary: 'Validate device passport code format (no auth required)' })
  @ApiParam({
    name: 'code',
    description: 'Device passport code to validate',
    example: 'DP-MED-2025-PLC-DE-000001-A7',
  })
  async validateDeviceCode(@Param('code') code: string) {
    return this.scanService.validateCode(code);
  }

  // ==========================================
  // Expert Passport Scanning
  // ==========================================

  @Get('expert/:code')
  @Public()
  @ApiOperation({ summary: 'Get public expert info by scanning passport code (no auth required)' })
  @ApiParam({
    name: 'code',
    description: 'Expert passport code',
    example: 'EP-TECH-2501-000001-A7',
  })
  async getExpertPublicInfo(@Param('code') code: string) {
    return this.scanService.getExpertPublicInfo(code);
  }

  @Get('expert/:code/validate')
  @Public()
  @ApiOperation({ summary: 'Validate expert passport code format (no auth required)' })
  @ApiParam({
    name: 'code',
    description: 'Expert passport code to validate',
    example: 'EP-TECH-2501-000001-A7',
  })
  async validateExpertCode(@Param('code') code: string) {
    return this.scanService.validateExpertCode(code);
  }

  // ==========================================
  // Legacy endpoint (backward compatibility)
  // ==========================================

  @Get(':code')
  @Public()
  @ApiOperation({ summary: 'Get public device info by scanning passport code (legacy, no auth required)' })
  @ApiParam({
    name: 'code',
    description: 'Device passport code',
    example: 'DP-MED-2025-PLC-DE-000001-A7',
  })
  async getPublicInfo(@Param('code') code: string) {
    return this.scanService.getPublicInfo(code);
  }

  @Get(':code/validate')
  @Public()
  @ApiOperation({ summary: 'Validate passport code format (legacy, no auth required)' })
  @ApiParam({
    name: 'code',
    description: 'Device passport code to validate',
    example: 'DP-MED-2025-PLC-DE-000001-A7',
  })
  async validateCode(@Param('code') code: string) {
    return this.scanService.validateCode(code);
  }
}
