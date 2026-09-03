import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreatePagePermission1788452574659 implements MigrationInterface {
  name = 'CreatePagePermission1788452574659';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`page_permissions\` (\`id\` varchar(36) NOT NULL, \`page_id\` varchar(36) NOT NULL, \`user_id\` varchar(36) NOT NULL, \`granted_by_id\` varchar(36) NOT NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), UNIQUE INDEX \`IDX_1c1ec8827e57e0968d2f787224\` (\`page_id\`, \`user_id\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX \`IDX_1c1ec8827e57e0968d2f787224\` ON \`page_permissions\``,
    );
    await queryRunner.query(`DROP TABLE \`page_permissions\``);
  }
}
