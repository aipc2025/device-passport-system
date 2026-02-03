import { Controller, Get, Post, Delete, Param, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { InvitationService } from './invitation.service';
import { InviterType } from '../../database/entities';

@ApiTags('Invitation')
@Controller('invitations')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class InvitationController {
  constructor(private readonly invitationService: InvitationService) {}

  @Post('codes')
  @ApiOperation({ summary: 'Generate a new invitation code' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        maxUses: { type: 'number', description: 'Maximum number of uses' },
        expiresInDays: { type: 'number', description: 'Days until expiration' },
        campaign: { type: 'string', description: 'Campaign name for tracking' },
        channel: { type: 'string', description: 'Source channel' },
      },
    },
  })
  async generateCode(
    @Request() req: any,
    @Body()
    body: {
      maxUses?: number;
      expiresInDays?: number;
      campaign?: string;
      channel?: string;
    }
  ) {
    // Determine user type
    const userType: InviterType = req.user.expertId ? 'EXPERT' : 'CUSTOMER';

    return this.invitationService.generateInvitationCode(req.user.sub, userType, body);
  }

  @Get('codes')
  @ApiOperation({ summary: 'Get my invitation codes' })
  async getMyCodes(@Request() req: any) {
    return this.invitationService.getMyInvitationCodes(req.user.sub);
  }

  @Delete('codes/:id')
  @ApiOperation({ summary: 'Deactivate an invitation code' })
  async deactivateCode(@Param('id') id: string, @Request() req: any) {
    await this.invitationService.deactivateCode(id, req.user.sub);
    return { message: 'Invitation code deactivated' };
  }

  @Get('validate/:code')
  @ApiOperation({ summary: 'Validate an invitation code' })
  async validateCode(@Param('code') code: string) {
    const result = await this.invitationService.validateInvitationCode(code);
    return {
      valid: result.valid,
      reason: result.reason,
      inviterName: result.invitationCode?.inviter?.name,
    };
  }

  @Get('records')
  @ApiOperation({ summary: 'Get my invitation records and stats' })
  async getMyRecords(@Request() req: any) {
    return this.invitationService.getMyInvitationRecords(req.user.sub);
  }
}
