import { SystemSetting } from '../entities/system-setting.entity.js';

export interface SystemSettingRepository {
  findAll(): Promise<SystemSetting[]>;
  findByKey(key: string): Promise<SystemSetting | null>;
  upsert(key: string, value: string): Promise<SystemSetting>;
}
