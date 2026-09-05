import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('system_setting')
export class SystemSetting {
  @PrimaryColumn({ type: 'varchar', length: 255 })
  key: string;

  @Column({ type: 'varchar', length: 255 })
  value: string;
}
