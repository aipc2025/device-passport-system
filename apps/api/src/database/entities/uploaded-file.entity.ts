import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { FileCategory } from '@device-passport/shared';

@Entity('uploaded_files')
export class UploadedFile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'original_name' })
  originalName: string;

  @Column({ name: 'stored_name' })
  storedName: string;

  @Column({ name: 'mime_type' })
  mimeType: string;

  @Column({ type: 'bigint' })
  size: number;

  @Column({ name: 'storage_path' })
  storagePath: string;

  @Column({ name: 'public_url', nullable: true })
  publicUrl: string;

  @Column({
    name: 'file_category',
    type: 'enum',
    enum: FileCategory,
    default: FileCategory.OTHER,
  })
  fileCategory: FileCategory;

  // Polymorphic relation
  @Column({ name: 'related_entity_type', nullable: true })
  relatedEntityType: string;

  @Column({ name: 'related_entity_id', nullable: true })
  relatedEntityId: string;

  // OCR (future feature)
  @Column({ name: 'ocr_data', type: 'jsonb', nullable: true })
  ocrData: Record<string, unknown>;

  @Column({ name: 'ocr_processed', default: false })
  ocrProcessed: boolean;

  @Column({ name: 'uploaded_by', nullable: true })
  uploadedBy: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
