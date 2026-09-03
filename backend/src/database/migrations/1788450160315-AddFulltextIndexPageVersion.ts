import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddFulltextIndexPageVersion1788450160315 implements MigrationInterface {
  name = 'AddFulltextIndexPageVersion1788450160315';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`page_versions\` ADD FULLTEXT INDEX \`ft_title_content\` (\`title\`, \`content\`)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`page_versions\` DROP INDEX \`ft_title_content\``,
    );
  }
}
