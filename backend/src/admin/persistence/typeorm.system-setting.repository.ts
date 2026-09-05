import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SystemSetting } from '../entities/system-setting.entity.js';
import { SystemSettingRepository } from './system-setting.repository.js';

@Injectable()
export class TypeormSystemSettingRepository implements SystemSettingRepository {
  constructor(
    @InjectRepository(SystemSetting)
    private readonly repository: Repository<SystemSetting>,
  ) {}

  findAll(): Promise<SystemSetting[]> {
    return this.repository.find();
  }

  findByKey(key: string): Promise<SystemSetting | null> {
    return this.repository.findOneBy({ key });
  }

  upsert(key: string, value: string): Promise<SystemSetting> {
    return this.repository.save({ key, value });
  }
}
