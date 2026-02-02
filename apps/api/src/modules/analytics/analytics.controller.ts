import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards';
import { AnalyticsService } from './analytics.service';

@ApiTags('Analytics')
@Controller('analytics')
@UseGuards(JwtAuthGuard)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('dashboard/overview')
  @ApiOperation({ summary: 'Get dashboard overview statistics' })
  async getDashboardOverview() {
    return this.analyticsService.getDashboardOverview();
  }

  @Get('passports/by-status')
  @ApiOperation({ summary: 'Get passports count grouped by status' })
  async getPassportsByStatus() {
    return this.analyticsService.getPassportsByStatus();
  }

  @Get('passports/by-product-line')
  @ApiOperation({ summary: 'Get passports count grouped by product line' })
  async getPassportsByProductLine() {
    return this.analyticsService.getPassportsByProductLine();
  }

  @Get('passports/trend')
  @ApiOperation({ summary: 'Get passports creation trend' })
  @ApiQuery({ name: 'days', required: false, type: Number })
  async getPassportsTrend(@Query('days') days: number = 30) {
    return this.analyticsService.getPassportsTrend(days);
  }

  @Get('lifecycle/distribution')
  @ApiOperation({ summary: 'Get lifecycle events distribution' })
  async getLifecycleDistribution() {
    return this.analyticsService.getLifecycleDistribution();
  }

  @Get('service-orders/by-status')
  @ApiOperation({ summary: 'Get service orders count by status' })
  async getServiceOrdersByStatus() {
    return this.analyticsService.getServiceOrdersByStatus();
  }

  @Get('service-orders/trend')
  @ApiOperation({ summary: 'Get service orders trend' })
  @ApiQuery({ name: 'days', required: false, type: Number })
  async getServiceOrdersTrend(@Query('days') days: number = 30) {
    return this.analyticsService.getServiceOrdersTrend(days);
  }

  @Get('experts/statistics')
  @ApiOperation({ summary: 'Get expert statistics' })
  async getExpertStatistics() {
    return this.analyticsService.getExpertStatistics();
  }

  @Get('service-requests/by-urgency')
  @ApiOperation({ summary: 'Get service requests count by urgency' })
  async getServiceRequestsByUrgency() {
    return this.analyticsService.getServiceRequestsByUrgency();
  }

  @Get('performance/response-times')
  @ApiOperation({ summary: 'Get average response times for service requests' })
  async getResponseTimes() {
    return this.analyticsService.getResponseTimes();
  }
}
