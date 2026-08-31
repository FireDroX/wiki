import { Logger, Module, OnModuleInit } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { AuthModule } from './auth/auth.module.js';
import { JwtAuthModule } from './common/jwt-auth.module.js';
import { HealthModule } from './health/health.module.js';
import { PagesModule } from './pages/pages.module.js';
import { StorageModule } from './storage/storage.module.js';
import { UsersModule } from './users/users.module.js';
import { typeOrmConfig } from './config/typeorm.config.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: typeOrmConfig,
    }),
    JwtAuthModule,
    HealthModule,
    StorageModule,
    UsersModule,
    AuthModule,
    PagesModule,
  ],
})
export class AppModule implements OnModuleInit {
  constructor(private readonly dataSource: DataSource) {}

  onModuleInit() {
    if (this.dataSource.isInitialized) {
      Logger.log('Database connected', 'TypeOrm');
    }
  }
}
