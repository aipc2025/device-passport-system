import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { UploadedFile } from '../../database/entities';
import { FileCategory } from '@device-passport/shared';

export interface UploadOptions {
  fileCategory?: FileCategory;
  relatedEntityType?: string;
  relatedEntityId?: string;
  uploadedBy?: string;
}

@Injectable()
export class UploadService {
  private readonly uploadDir: string;
  private readonly maxFileSize: number;
  private readonly allowedMimeTypes: string[];

  constructor(
    @InjectRepository(UploadedFile)
    private readonly uploadedFileRepository: Repository<UploadedFile>,
    private readonly configService: ConfigService,
  ) {
    this.uploadDir = this.configService.get('UPLOAD_DIR') || './uploads';
    this.maxFileSize = parseInt(this.configService.get('MAX_FILE_SIZE') || '10485760', 10); // 10MB default
    this.allowedMimeTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];

    // Ensure upload directory exists
    this.ensureUploadDir();
  }

  private ensureUploadDir(): void {
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  private getCategoryDir(category: FileCategory): string {
    const categoryDir = path.join(this.uploadDir, category.toLowerCase());
    if (!fs.existsSync(categoryDir)) {
      fs.mkdirSync(categoryDir, { recursive: true });
    }
    return categoryDir;
  }

  async uploadFile(
    file: Express.Multer.File,
    options: UploadOptions = {},
  ): Promise<UploadedFile> {
    // Validate file
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    if (file.size > this.maxFileSize) {
      throw new BadRequestException(
        `File size exceeds maximum allowed size of ${this.maxFileSize / 1024 / 1024}MB`,
      );
    }

    if (!this.allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        `File type ${file.mimetype} is not allowed. Allowed types: ${this.allowedMimeTypes.join(', ')}`,
      );
    }

    const fileCategory = options.fileCategory || FileCategory.OTHER;
    const categoryDir = this.getCategoryDir(fileCategory);

    // Generate unique filename
    const fileExt = path.extname(file.originalname);
    const storedName = `${Date.now()}-${uuidv4()}${fileExt}`;
    const storagePath = path.join(categoryDir, storedName);

    // Write file to disk
    fs.writeFileSync(storagePath, file.buffer);

    // Create database record
    const uploadedFile = this.uploadedFileRepository.create({
      originalName: file.originalname,
      storedName,
      mimeType: file.mimetype,
      size: file.size,
      storagePath,
      publicUrl: `/uploads/${fileCategory.toLowerCase()}/${storedName}`,
      fileCategory,
      relatedEntityType: options.relatedEntityType,
      relatedEntityId: options.relatedEntityId,
      uploadedBy: options.uploadedBy,
    });

    return this.uploadedFileRepository.save(uploadedFile);
  }

  async uploadMultiple(
    files: Express.Multer.File[],
    options: UploadOptions = {},
  ): Promise<UploadedFile[]> {
    const results: UploadedFile[] = [];
    for (const file of files) {
      const uploaded = await this.uploadFile(file, options);
      results.push(uploaded);
    }
    return results;
  }

  async findById(id: string): Promise<UploadedFile> {
    const file = await this.uploadedFileRepository.findOne({ where: { id } });
    if (!file) {
      throw new NotFoundException('File not found');
    }
    return file;
  }

  async findByIds(ids: string[]): Promise<UploadedFile[]> {
    if (!ids || ids.length === 0) {
      return [];
    }
    return this.uploadedFileRepository.findByIds(ids);
  }

  async findByEntity(
    entityType: string,
    entityId: string,
  ): Promise<UploadedFile[]> {
    return this.uploadedFileRepository.find({
      where: {
        relatedEntityType: entityType,
        relatedEntityId: entityId,
      },
    });
  }

  async updateRelatedEntity(
    fileId: string,
    entityType: string,
    entityId: string,
  ): Promise<UploadedFile> {
    const file = await this.findById(fileId);
    file.relatedEntityType = entityType;
    file.relatedEntityId = entityId;
    return this.uploadedFileRepository.save(file);
  }

  async delete(id: string): Promise<void> {
    const file = await this.findById(id);

    // Delete physical file
    if (fs.existsSync(file.storagePath)) {
      fs.unlinkSync(file.storagePath);
    }

    // Delete database record
    await this.uploadedFileRepository.remove(file);
  }

  async deleteByEntity(entityType: string, entityId: string): Promise<void> {
    const files = await this.findByEntity(entityType, entityId);
    for (const file of files) {
      await this.delete(file.id);
    }
  }

  getFilePath(file: UploadedFile): string {
    return file.storagePath;
  }

  getFileBuffer(file: UploadedFile): Buffer {
    if (!fs.existsSync(file.storagePath)) {
      throw new NotFoundException('Physical file not found');
    }
    return fs.readFileSync(file.storagePath);
  }
}
