import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { ExpertRatingService } from './expert-rating.service';
import { ServiceRecordStatus, ReviewStatus } from '@device-passport/shared';

interface AuthenticatedRequest {
  user: {
    sub: string;
    email: string;
    expertId?: string;
  };
}

// DTOs
class CreateServiceRecordDto {
  serviceRequestId: string;
  expertId: string;
  agreedPrice: number;
  priceCurrency?: string;
  estimatedDuration?: string;
  scheduledStart?: Date;
  scheduledEnd?: Date;
  expertNotes?: string;
}

class UpdateServiceRecordDto {
  status?: ServiceRecordStatus;
  finalPrice?: number;
  actualDuration?: string;
  actualStart?: Date;
  actualEnd?: Date;
  expertNotes?: string;
  customerNotes?: string;
  completionNotes?: string;
  serviceLocation?: string;
}

class CreateReviewDto {
  serviceRecordId: string;
  overallRating: number;
  qualityRating?: number;
  communicationRating?: number;
  punctualityRating?: number;
  professionalismRating?: number;
  valueRating?: number;
  title?: string;
  comment?: string;
  pros?: string[];
  cons?: string[];
}

class ExpertResponseDto {
  response: string;
}

class FlagReviewDto {
  reason: string;
}

class VoteReviewDto {
  isHelpful: boolean;
}

@ApiTags('Expert Rating')
@Controller('expert-rating')
export class ExpertRatingController {
  constructor(private readonly ratingService: ExpertRatingService) {}

  // ==================== Service Records ====================

  @Post('service-records')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a service record when expert is assigned' })
  @ApiResponse({ status: 201, description: 'Service record created' })
  async createServiceRecord(
    @Request() req: AuthenticatedRequest,
    @Body() dto: CreateServiceRecordDto
  ) {
    return this.ratingService.createServiceRecord(dto, req.user.sub);
  }

  @Get('service-records/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get service record by ID' })
  @ApiResponse({ status: 200, description: 'Service record found' })
  async getServiceRecord(@Param('id') id: string) {
    return this.ratingService.getServiceRecord(id);
  }

  @Get('service-records/expert/:expertId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get service records for an expert' })
  @ApiResponse({ status: 200, description: 'List of service records' })
  async getExpertServiceRecords(
    @Param('expertId') expertId: string,
    @Query('status') status?: ServiceRecordStatus,
    @Query('limit') limit?: number
  ) {
    return this.ratingService.getExpertServiceRecords(expertId, status, limit);
  }

  @Get('service-records/customer/my')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get service records for current user (customer)' })
  @ApiResponse({ status: 200, description: 'List of service records' })
  async getMyServiceRecords(
    @Request() req: AuthenticatedRequest,
    @Query('status') status?: ServiceRecordStatus,
    @Query('limit') limit?: number
  ) {
    return this.ratingService.getCustomerServiceRecords(req.user.sub, status, limit);
  }

  @Patch('service-records/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update service record' })
  @ApiResponse({ status: 200, description: 'Service record updated' })
  async updateServiceRecord(
    @Request() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() dto: UpdateServiceRecordDto
  ) {
    const isExpert = !!req.user.expertId;
    const userId = isExpert ? req.user.expertId! : req.user.sub;
    return this.ratingService.updateServiceRecord(id, dto, userId, isExpert);
  }

  @Post('service-records/:id/start')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Start service (expert)' })
  @ApiResponse({ status: 200, description: 'Service started' })
  async startService(@Request() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.ratingService.updateServiceRecord(
      id,
      { status: ServiceRecordStatus.IN_PROGRESS },
      req.user.expertId || req.user.sub,
      true
    );
  }

  @Post('service-records/:id/complete')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Complete service (expert)' })
  @ApiResponse({ status: 200, description: 'Service completed' })
  async completeService(
    @Request() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() dto: { finalPrice?: number; completionNotes?: string }
  ) {
    return this.ratingService.updateServiceRecord(
      id,
      {
        status: ServiceRecordStatus.COMPLETED,
        finalPrice: dto.finalPrice,
        completionNotes: dto.completionNotes,
      },
      req.user.expertId || req.user.sub,
      true
    );
  }

  @Post('service-records/:id/confirm')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Customer confirms service completion' })
  @ApiResponse({ status: 200, description: 'Service confirmed' })
  async confirmCompletion(@Request() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.ratingService.confirmCompletion(id, req.user.sub);
  }

  @Post('service-records/:id/cancel')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cancel service' })
  @ApiResponse({ status: 200, description: 'Service cancelled' })
  async cancelService(
    @Request() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() dto: { reason?: string }
  ) {
    const isExpert = !!req.user.expertId;
    const userId = isExpert ? req.user.expertId! : req.user.sub;

    const record = await this.ratingService.getServiceRecord(id);
    if (dto.reason) {
      record.cancellationReason = dto.reason;
    }
    record.cancelledBy = userId;

    return this.ratingService.updateServiceRecord(
      id,
      { status: ServiceRecordStatus.CANCELLED },
      userId,
      isExpert
    );
  }

  // ==================== Reviews ====================

  @Post('reviews')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a review for completed service' })
  @ApiResponse({ status: 201, description: 'Review created' })
  async createReview(@Request() req: AuthenticatedRequest, @Body() dto: CreateReviewDto) {
    return this.ratingService.createReview(dto, req.user.sub);
  }

  @Get('reviews/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get review by ID' })
  @ApiResponse({ status: 200, description: 'Review found' })
  async getReview(@Param('id') id: string) {
    return this.ratingService.getReview(id);
  }

  @Get('reviews/expert/:expertId')
  @ApiOperation({ summary: 'Get reviews for an expert (public)' })
  @ApiResponse({ status: 200, description: 'List of reviews' })
  async getExpertReviews(@Param('expertId') expertId: string, @Query('limit') limit?: number) {
    return this.ratingService.getExpertReviews(expertId, ReviewStatus.PUBLISHED, limit);
  }

  @Post('reviews/:id/respond')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Expert responds to a review' })
  @ApiResponse({ status: 200, description: 'Response added' })
  async respondToReview(
    @Request() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() dto: ExpertResponseDto
  ) {
    return this.ratingService.respondToReview(id, req.user.expertId || req.user.sub, dto);
  }

  @Post('reviews/:id/flag')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Flag a review for moderation' })
  @ApiResponse({ status: 200, description: 'Review flagged' })
  async flagReview(
    @Request() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() dto: FlagReviewDto
  ) {
    return this.ratingService.flagReview(id, dto.reason, req.user.sub);
  }

  @Post('reviews/:id/vote')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Vote on review helpfulness' })
  @ApiResponse({ status: 200, description: 'Vote recorded' })
  async voteReview(@Param('id') id: string, @Body() dto: VoteReviewDto) {
    return this.ratingService.voteReview(id, dto.isHelpful);
  }

  // ==================== Rating Summary ====================

  @Get('summary/:expertId')
  @ApiOperation({ summary: 'Get expert rating summary (public)' })
  @ApiResponse({ status: 200, description: 'Rating summary' })
  async getExpertRatingSummary(@Param('expertId') expertId: string) {
    return this.ratingService.getExpertRatingSummary(expertId);
  }
}
