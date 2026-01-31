import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { ContactService } from './contact.service';
import { CreateContactDto, UpdateContactDto } from './dto';
import { JwtAuthGuard, RolesGuard } from '../../common/guards';
import { Roles } from '../../common/decorators';
import { UserRole } from '@device-passport/shared';

@ApiTags('Organization Contacts')
@Controller('organizations/:orgId/contacts')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  @Get()
  @Roles(UserRole.OPERATOR)
  @ApiOperation({ summary: 'Get all contacts for an organization' })
  @ApiParam({ name: 'orgId', description: 'Organization ID' })
  async findAll(@Param('orgId', ParseUUIDPipe) orgId: string) {
    return this.contactService.findAll(orgId);
  }

  @Get(':id')
  @Roles(UserRole.OPERATOR)
  @ApiOperation({ summary: 'Get contact by ID' })
  @ApiParam({ name: 'orgId', description: 'Organization ID' })
  @ApiParam({ name: 'id', description: 'Contact ID' })
  async findById(
    @Param('orgId', ParseUUIDPipe) orgId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.contactService.findById(orgId, id);
  }

  @Post()
  @Roles(UserRole.OPERATOR)
  @ApiOperation({ summary: 'Create a new contact' })
  @ApiParam({ name: 'orgId', description: 'Organization ID' })
  async create(
    @Param('orgId', ParseUUIDPipe) orgId: string,
    @Body() dto: CreateContactDto,
  ) {
    return this.contactService.create(orgId, dto);
  }

  @Patch(':id')
  @Roles(UserRole.OPERATOR)
  @ApiOperation({ summary: 'Update contact' })
  @ApiParam({ name: 'orgId', description: 'Organization ID' })
  @ApiParam({ name: 'id', description: 'Contact ID' })
  async update(
    @Param('orgId', ParseUUIDPipe) orgId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateContactDto,
  ) {
    return this.contactService.update(orgId, id, dto);
  }

  @Patch(':id/notes')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update contact personal notes (Admin only)' })
  @ApiParam({ name: 'orgId', description: 'Organization ID' })
  @ApiParam({ name: 'id', description: 'Contact ID' })
  async updateNotes(
    @Param('orgId', ParseUUIDPipe) orgId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body('personalNotes') personalNotes: string,
  ) {
    return this.contactService.updateNotes(orgId, id, personalNotes);
  }

  @Delete(':id')
  @Roles(UserRole.OPERATOR)
  @ApiOperation({ summary: 'Delete contact' })
  @ApiParam({ name: 'orgId', description: 'Organization ID' })
  @ApiParam({ name: 'id', description: 'Contact ID' })
  async delete(
    @Param('orgId', ParseUUIDPipe) orgId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    await this.contactService.delete(orgId, id);
    return { success: true };
  }
}
