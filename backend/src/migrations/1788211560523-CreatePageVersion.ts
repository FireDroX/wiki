import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreatePageVersion1788211560523 implements MigrationInterface {
  name = 'CreatePageVersion1788211560523';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`page_versions\` (\`id\` varchar(36) NOT NULL, \`page_id\` varchar(36) NOT NULL, \`content\` text NOT NULL, \`title\` varchar(255) NOT NULL, \`author_id\` varchar(36) NOT NULL, \`change_summary\` varchar(255) NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE \`page_versions\``);
  }
}
