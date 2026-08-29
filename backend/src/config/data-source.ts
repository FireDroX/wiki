import 'dotenv/config';
import { DataSource } from 'typeorm';

/**
 * CLI-only DataSource, used by the `migration:*` scripts via `tsx`
 * (run against raw TS in `src/`, not compiled `dist/`). Not wired into
 * Nest's DI — env vars are loaded directly via `dotenv/config` since
 * there's no ConfigModule outside a running Nest app.
 */
export default new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  synchronize: false,
  entities: [`${import.meta.dirname}/../**/*.entity.ts`],
  migrations: [`${import.meta.dirname}/../migrations/*.ts`],
});
