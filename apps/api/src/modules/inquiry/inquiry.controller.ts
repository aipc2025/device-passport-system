import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { InquiryService } from './inquiry.service';
import { CreateInquiryDto, CreateMessageDto, UpdateInquiryStatusDto } from './dto';
import { JwtAuthGuard, RolesGuard } from '../../common/guards';
import { CurrentUser, Roles } from '../../common/decorators';
import { TokenPayload, UserRole } from '@device-passport/shared';

@ApiTags('Inquiries')
@Controller('inquiries')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class InquiryController {
  constructor(private readonly inquiryService: InquiryService) {}

  @Get()
  @Roles(UserRole.CUSTOMER, UserRole.OPERATOR, UserRole.ADMIN)
  @ApiOperation({ summary: 'Get all inquiries for current organization' })
  async getAllInquiries(@CurrentUser() user: TokenPayload) {
    return this.inquiryService.getAllInquiries(user.organizationId!);
  }

  @Get('sent')
  @Roles(UserRole.CUSTOMER, UserRole.OPERATOR, UserRole.ADMIN)
  @ApiOperation({ summary: 'Get inquiries sent by current organization (as buyer)' })
  async getSentInquiries(@CurrentUser() user: TokenPayload) {
    return this.inquiryService.getSentInquiries(user.organizationId!);
  }

  @Get('received')
  @Roles(UserRole.OPERATOR, UserRole.ADMIN)
  @ApiOperation({ summary: 'Get inquiries received by current organization (as supplier)' })
  async getReceivedInquiries(@CurrentUser() user: TokenPayload) {
    return this.inquiryService.getReceivedInquiries(user.organizationId!);
  }

  @Get('unread-count')
  @Roles(UserRole.CUSTOMER, UserRole.OPERATOR, UserRole.ADMIN)
  @ApiOperation({ summary: 'Get unread message count' })
  async getUnreadCount(@CurrentUser() user: TokenPayload) {
    const count = await this.inquiryService.getUnreadCount(user.organizationId!);
    return { unreadCount: count };
  }

  @Get(':id')
  @Roles(UserRole.CUSTOMER, UserRole.OPERATOR, UserRole.ADMIN)
  @ApiOperation({ summary: 'Get inquiry details with messages' })
  @ApiParam({ name: 'id', description: 'Inquiry ID' })
  async getInquiry(@CurrentUser() user: TokenPayload, @Param('id', ParseUUIDPipe) id: string) {
    const inquiry = await this.inquiryService.getInquiryWithAccess(id, user.organizationId!);
    // Mark messages as read when viewing
    await this.inquiryService.markMessagesAsRead(id, user.organizationId!);
    return inquiry;
  }

  @Post()
  @Roles(UserRole.CUSTOMER, UserRole.OPERATOR, UserRole.ADMIN)
  @ApiOperation({ summary: 'Create a new inquiry' })
  async createInquiry(@CurrentUser() user: TokenPayload, @Body() dto: CreateInquiryDto) {
    return this.inquiryService.createInquiry(user.organizationId!, user.sub, dto);
  }

  @Patch(':id/status')
  @Roles(UserRole.CUSTOMER, UserRole.OPERATOR, UserRole.ADMIN)
  @ApiOperation({ summary: 'Update inquiry status' })
  @ApiParam({ name: 'id', description: 'Inquiry ID' })
  async updateStatus(
    @CurrentUser() user: TokenPayload,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateInquiryStatusDto
  ) {
    return this.inquiryService.updateStatus(id, user.organizationId!, dto);
  }

  @Get(':id/messages')
  @Roles(UserRole.CUSTOMER, UserRole.OPERATOR, UserRole.ADMIN)
  @ApiOperation({ summary: 'Get messages for an inquiry' })
  @ApiParam({ name: 'id', description: 'Inquiry ID' })
  async getMessages(@CurrentUser() user: TokenPayload, @Param('id', ParseUUIDPipe) id: string) {
    return this.inquiryService.getMessages(id, user.organizationId!);
  }

  @Post(':id/messages')
  @Roles(UserRole.CUSTOMER, UserRole.OPERATOR, UserRole.ADMIN)
  @ApiOperation({ summary: 'Send a message in an inquiry' })
  @ApiParam({ name: 'id', description: 'Inquiry ID' })
  async sendMessage(
    @CurrentUser() user: TokenPayload,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CreateMessageDto
  ) {
    return this.inquiryService.sendMessage(id, user.sub, user.organizationId!, dto);
  }

  @Patch(':id/messages/read')
  @Roles(UserRole.CUSTOMER, UserRole.OPERATOR, UserRole.ADMIN)
  @ApiOperation({ summary: 'Mark all messages in inquiry as read' })
  @ApiParam({ name: 'id', description: 'Inquiry ID' })
  async markAsRead(@CurrentUser() user: TokenPayload, @Param('id', ParseUUIDPipe) id: string) {
    await this.inquiryService.markMessagesAsRead(id, user.organizationId!);
    return { success: true };
  }
}
