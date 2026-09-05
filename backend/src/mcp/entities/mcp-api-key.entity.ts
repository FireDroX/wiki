import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('mcp_api_keys')
export class McpApiKey {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 255, name: 'key_hash', unique: true })
  keyHash: string;

  @Column({ type: 'json' })
  scopes: string[];

  @Column({ type: 'uuid', name: 'created_by_id', length: 36 })
  createdById: string;

  @Column({ type: 'datetime', name: 'last_used_at', nullable: true })
  lastUsedAt: Date | null;

  @Column({ type: 'datetime', name: 'revoked_at', nullable: true })
  revokedAt: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
