import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreatePage1788211035764 implements MigrationInterface {
  name = 'CreatePage1788211035764';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`pages\` (\`id\` varchar(36) NOT NULL, \`slug\` varchar(255) NOT NULL, \`title\` varchar(255) NOT NULL, \`parent_id\` varchar(36) NULL, \`current_version_id\` varchar(36) NULL, \`is_published\` tinyint NOT NULL DEFAULT 0, \`visibility\` enum ('public', 'private') NOT NULL DEFAULT 'private', \`created_by_id\` varchar(36) NOT NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` datetime(6) NULL, UNIQUE INDEX \`IDX_e199a6e69d360ba98e6738f02e\` (\`parent_id\`, \`slug\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX \`IDX_e199a6e69d360ba98e6738f02e\` ON \`pages\``,
    );
    await queryRunner.query(`DROP TABLE \`pages\``);
  }
}
