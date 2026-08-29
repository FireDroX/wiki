import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Initial migration: proves the migration pipeline works end-to-end
 * (connection, `migration:run`, tracking table) before any real
 * entity exists. Creates and drops an empty test table.
 */
export class InitTestTable1788006950706 implements MigrationInterface {
  name = 'InitTestTable1788006950706';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`test\` (\`id\` INT NOT NULL AUTO_INCREMENT, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE \`test\``);
  }
}
