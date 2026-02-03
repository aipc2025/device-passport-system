import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards';
import { CurrentUser } from '../../common/decorators';
import { TokenPayload } from '@device-passport/shared';
import { NotificationService } from './notification.service';

@ApiTags('notifications')
@Controller('notifications')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  @ApiOperation({ summary: 'Get user notifications (paginated)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getNotifications(
    @CurrentUser() user: TokenPayload,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    const result = await this.notificationService.getUserNotifications(user.sub, page, limit);
    return {
      notifications: result.notifications,
      total: result.total,
      page,
      limit,
      totalPages: Math.ceil(result.total / limit),
    };
  }

  @Get('unread')
  @ApiOperation({ summary: 'Get unread notifications' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getUnreadNotifications(
    @CurrentUser() user: TokenPayload,
    @Query('limit', new DefaultValuePipe(50), ParseIntPipe) limit: number,
  ) {
    const notifications = await this.notificationService.getUnreadNotifications(user.sub, limit);
    return { notifications };
  }

  @Get('unread-count')
  @ApiOperation({ summary: 'Get unread notification count' })
  async getUnreadCount(@CurrentUser() user: TokenPayload) {
    const count = await this.notificationService.getUnreadCount(user.sub);
    return { count };
  }

  @Post('mark-read')
  @ApiOperation({ summary: 'Mark specific notifications as read' })
  async markAsRead(
    @CurrentUser() user: TokenPayload,
    @Body() body: { notificationIds: string[] },
  ) {
    const count = await this.notificationService.markAsRead(user.sub, body.notificationIds);
    return { success: true, count };
  }

  @Post('mark-all-read')
  @ApiOperation({ summary: 'Mark all notifications as read' })
  async markAllAsRead(@CurrentUser() user: TokenPayload) {
    const count = await this.notificationService.markAllAsRead(user.sub);
    return { success: true, count };
  }
}
