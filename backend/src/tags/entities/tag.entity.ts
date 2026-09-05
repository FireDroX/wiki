import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { DEFAULT_TAG_COLOR } from '../../common/variables.global.js';

@Entity('tags')
export class Tag {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  name: string;

  @Column({ type: 'varchar', length: 7, default: DEFAULT_TAG_COLOR })
  color: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
