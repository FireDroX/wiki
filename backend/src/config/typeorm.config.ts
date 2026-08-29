import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

/**
 * Runtime TypeORM options, consumed by `TypeOrmModule.forRootAsync` in
 * AppModule. Targets compiled output (`dist/**`), since Nest's default
 * `tsc` builder writes `.js` files there before running the app.
 *
 * `synchronize` is hardcoded to `false` (never env-driven) so it can
 * never be flipped on by accident in any environment.
 */
export function typeOrmConfig(config: ConfigService): TypeOrmModuleOptions {
  return {
    type: 'mysql',
    host: config.get<string>('DB_HOST'),
    port: config.get<number>('DB_PORT'),
    username: config.get<string>('DB_USERNAME'),
    password: config.get<string>('DB_PASSWORD'),
    database: config.get<string>('DB_DATABASE'),
    synchronize: false,
    entities: [`${import.meta.dirname}/../**/*.entity.js`],
    migrations: [`${import.meta.dirname}/../migrations/*.js`],
  };
}
