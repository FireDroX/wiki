import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPageVersionPageIdIndex1788274919262 implements MigrationInterface {
  name = 'AddPageVersionPageIdIndex1788274919262';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE INDEX \`IDX_e0797ec63e135341486d20ab68\` ON \`page_versions\` (\`page_id\`)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX \`IDX_e0797ec63e135341486d20ab68\` ON \`page_versions\``,
    );
  }
}
