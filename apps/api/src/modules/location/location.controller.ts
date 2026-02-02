import { Controller, Get, Query, ParseFloatPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { LocationService } from './location.service';

@ApiTags('Location')
@Controller('location')
export class LocationController {
  constructor(private readonly locationService: LocationService) {}

  @Get('nearby/experts')
  @ApiOperation({ summary: 'Find nearby experts' })
  @ApiQuery({ name: 'lat', type: Number, required: true })
  @ApiQuery({ name: 'lng', type: Number, required: true })
  @ApiQuery({ name: 'radius', type: Number, required: false, description: 'Search radius in kilometers (default: 50)' })
  async findNearbyExperts(
    @Query('lat', ParseFloatPipe) latitude: number,
    @Query('lng', ParseFloatPipe) longitude: number,
    @Query('radius') radius?: number,
  ) {
    const searchRadius = radius || 50;
    return this.locationService.findNearbyExperts(latitude, longitude, searchRadius);
  }

  @Get('nearby/service-requests')
  @ApiOperation({ summary: 'Find nearby service requests' })
  @ApiQuery({ name: 'lat', type: Number, required: true })
  @ApiQuery({ name: 'lng', type: Number, required: true })
  @ApiQuery({ name: 'radius', type: Number, required: false, description: 'Search radius in kilometers (default: 50)' })
  async findNearbyServiceRequests(
    @Query('lat', ParseFloatPipe) latitude: number,
    @Query('lng', ParseFloatPipe) longitude: number,
    @Query('radius') radius?: number,
  ) {
    const searchRadius = radius || 50;
    return this.locationService.findNearbyServiceRequests(latitude, longitude, searchRadius);
  }

  @Get('nearby/devices')
  @ApiOperation({ summary: 'Find nearby devices' })
  @ApiQuery({ name: 'lat', type: Number, required: true })
  @ApiQuery({ name: 'lng', type: Number, required: true })
  @ApiQuery({ name: 'radius', type: Number, required: false, description: 'Search radius in kilometers (default: 50)' })
  async findNearbyDevices(
    @Query('lat', ParseFloatPipe) latitude: number,
    @Query('lng', ParseFloatPipe) longitude: number,
    @Query('radius') radius?: number,
  ) {
    const searchRadius = radius || 50;
    return this.locationService.findNearbyDevices(latitude, longitude, searchRadius);
  }

  @Get('geocode')
  @ApiOperation({ summary: 'Reverse geocode coordinates to address' })
  @ApiQuery({ name: 'lat', type: Number, required: true })
  @ApiQuery({ name: 'lng', type: Number, required: true })
  async reverseGeocode(
    @Query('lat', ParseFloatPipe) latitude: number,
    @Query('lng', ParseFloatPipe) longitude: number,
  ) {
    return this.locationService.reverseGeocode(latitude, longitude);
  }
}
