import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('page_permissions')
@Index(['pageId', 'userId'], { unique: true })
export class PagePermission {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'page_id', length: 36 })
  pageId: string;

  @Column({ type: 'uuid', name: 'user_id', length: 36 })
  userId: string;

  @Column({ type: 'uuid', name: 'granted_by_id', length: 36 })
  grantedById: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
