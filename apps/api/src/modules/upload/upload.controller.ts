import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  Body,
  Res,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiConsumes,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { Response } from 'express';
import { JwtAuthGuard } from '../../common/guards';
import { CurrentUser } from '../../common/decorators';
import { UploadService, UploadOptions } from './upload.service';
import { FileCategory } from '@device-passport/shared';
import { User } from '../../database/entities';

@ApiTags('Upload')
@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload a single file' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
        fileCategory: {
          type: 'string',
          enum: Object.values(FileCategory),
        },
        relatedEntityType: {
          type: 'string',
        },
        relatedEntityId: {
          type: 'string',
        },
      },
    },
  })
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body('fileCategory') fileCategory: FileCategory,
    @Body('relatedEntityType') relatedEntityType?: string,
    @Body('relatedEntityId') relatedEntityId?: string,
    @CurrentUser() user?: User,
  ) {
    const options: UploadOptions = {
      fileCategory: fileCategory || FileCategory.OTHER,
      relatedEntityType,
      relatedEntityId,
      uploadedBy: user?.id,
    };

    const uploadedFile = await this.uploadService.uploadFile(file, options);

    return {
      id: uploadedFile.id,
      originalName: uploadedFile.originalName,
      mimeType: uploadedFile.mimeType,
      size: uploadedFile.size,
      publicUrl: uploadedFile.publicUrl,
    };
  }

  @Post('multiple')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @UseInterceptors(FilesInterceptor('files', 10))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload multiple files' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        files: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
        },
        fileCategory: {
          type: 'string',
          enum: Object.values(FileCategory),
        },
      },
    },
  })
  async uploadMultiple(
    @UploadedFiles() files: Express.Multer.File[],
    @Body('fileCategory') fileCategory: FileCategory,
    @CurrentUser() user?: User,
  ) {
    const options: UploadOptions = {
      fileCategory: fileCategory || FileCategory.OTHER,
      uploadedBy: user?.id,
    };

    const uploadedFiles = await this.uploadService.uploadMultiple(files, options);

    return uploadedFiles.map((file) => ({
      id: file.id,
      originalName: file.originalName,
      mimeType: file.mimeType,
      size: file.size,
      publicUrl: file.publicUrl,
    }));
  }

  @Post('public')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload a file without authentication (for registration or service request)' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
        fileCategory: {
          type: 'string',
          enum: Object.values(FileCategory),
        },
        passportCode: {
          type: 'string',
          description: 'Optional passport code for service attachments naming',
        },
      },
    },
  })
  async uploadPublic(
    @UploadedFile() file: Express.Multer.File,
    @Body('fileCategory') fileCategory: FileCategory,
    @Body('passportCode') passportCode?: string,
  ) {
    const options: UploadOptions = {
      fileCategory: fileCategory || FileCategory.OTHER,
      passportCode,
    };

    const uploadedFile = await this.uploadService.uploadFile(file, options);

    return {
      id: uploadedFile.id,
      originalName: uploadedFile.originalName,
      mimeType: uploadedFile.mimeType,
      size: uploadedFile.size,
      publicUrl: uploadedFile.publicUrl,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get file metadata by ID' })
  async getFile(@Param('id', ParseUUIDPipe) id: string) {
    const file = await this.uploadService.findById(id);
    return {
      id: file.id,
      originalName: file.originalName,
      mimeType: file.mimeType,
      size: file.size,
      publicUrl: file.publicUrl,
      fileCategory: file.fileCategory,
      createdAt: file.createdAt,
    };
  }

  @Get(':id/download')
  @ApiOperation({ summary: 'Download file' })
  async downloadFile(
    @Param('id', ParseUUIDPipe) id: string,
    @Res() res: Response,
  ) {
    const file = await this.uploadService.findById(id);
    const buffer = this.uploadService.getFileBuffer(file);

    res.set({
      'Content-Type': file.mimeType,
      'Content-Disposition': `attachment; filename="${file.originalName}"`,
      'Content-Length': buffer.length,
    });

    res.send(buffer);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a file' })
  async deleteFile(@Param('id', ParseUUIDPipe) id: string) {
    await this.uploadService.delete(id);
    return { success: true };
  }
}
