import { Inject, Injectable } from '@nestjs/common';
import { SUPPORTED_LOCALES } from '../../common/variables.global.js';
import { InvalidSettingValueException } from '../../common/exceptions/admin/invalid-setting-value.exception.js';
import { SystemSetting } from '../entities/system-setting.entity.js';
import type { SystemSettingRepository } from '../persistence/system-setting.repository.js';

const SETTING_VALIDATORS: Record<string, string[]> = {
  locale: SUPPORTED_LOCALES,
};

@Injectable()
export class SystemSettingsService {
  constructor(
    @Inject('SystemSettingsRepository')
    private readonly systemSettingRepository: SystemSettingRepository,
  ) {}

  getAll(): Promise<SystemSetting[]> {
    return this.systemSettingRepository.findAll();
  }

  update(key: string, value: string): Promise<SystemSetting> {
    this.validate(key, value);
    return this.systemSettingRepository.upsert(key, value);
  }

  private validate(key: string, value: string): void {
    const allowedValues = SETTING_VALIDATORS[key];
    if (!allowedValues) {
      throw new InvalidSettingValueException(`Unknown setting key: ${key}`);
    }
    if (!allowedValues.includes(value)) {
      throw new InvalidSettingValueException(
        `value must be one of the following values: ${allowedValues.join(', ')}`,
      );
    }
  }
}
