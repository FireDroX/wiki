import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('attachments')
@Index(['pageId'])
export class Attachment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'page_id', length: 36, nullable: true })
  pageId: string | null;

  @Column({ type: 'varchar', length: 500, name: 'minio_key' })
  minioKey: string;

  @Column({ type: 'varchar', length: 255 })
  filename: string;

  @Column({ type: 'varchar', length: 100, name: 'mime_type' })
  mimeType: string;

  @Column({ type: 'int' })
  size: number;

  @Column({ type: 'uuid', name: 'uploaded_by_id', length: 36 })
  uploadedById: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
