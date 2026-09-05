import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SystemSetting } from './entities/system-setting.entity.js';
import { TypeormSystemSettingRepository } from './persistence/typeorm.system-setting.repository.js';
import {
  AdminSettingsController,
  SettingsController,
} from './settings.controller.js';
import { SystemSettingsService } from './services/system-settings.service.js';

@Module({
  imports: [TypeOrmModule.forFeature([SystemSetting])],
  controllers: [SettingsController, AdminSettingsController],
  providers: [
    {
      provide: 'SystemSettingsRepository',
      useClass: TypeormSystemSettingRepository,
    },
    SystemSettingsService,
  ],
})
export class AdminModule {}
