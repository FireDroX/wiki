import { SystemSetting } from '../entities/system-setting.entity.js';
import {
  PublicSettingsResponseDto,
  SystemSettingResponseDto,
} from '../dto/out/system-setting-response.dto.js';

export class SystemSettingMapper {
  static toResponse(entity: SystemSetting): SystemSettingResponseDto {
    return { key: entity.key, value: entity.value };
  }

  static toPublicSettingsResponse(
    entities: SystemSetting[],
  ): PublicSettingsResponseDto {
    return Object.fromEntries(
      entities.map((entity) => [entity.key, entity.value]),
    );
  }
}
