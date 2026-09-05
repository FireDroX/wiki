import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SystemSetting } from './entities/system-setting.entity.js';
import { TypeormSystemSettingRepository } from './persistence/typeorm.system-setting.repository.js';

@Module({
  imports: [TypeOrmModule.forFeature([SystemSetting])],
  providers: [
    {
      provide: 'SystemSettingsRepository',
      useClass: TypeormSystemSettingRepository,
    },
  ],
})
export class AdminModule {}
