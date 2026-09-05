import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTagAndPageTag1788607700000 implements MigrationInterface {
  name = 'CreateTagAndPageTag1788607700000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`tags\` (\`id\` varchar(36) NOT NULL, \`name\` varchar(50) NOT NULL, \`color\` varchar(7) NOT NULL DEFAULT '#6b7280', \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), UNIQUE INDEX \`IDX_e7dc17249a1148a1970748eda9\` (\`name\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`page_tags\` (\`page_id\` varchar(36) NOT NULL, \`tag_id\` varchar(36) NOT NULL, PRIMARY KEY (\`page_id\`, \`tag_id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `ALTER TABLE \`page_tags\` ADD CONSTRAINT \`FK_page_tags_page_id\` FOREIGN KEY (\`page_id\`) REFERENCES \`pages\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE \`page_tags\` ADD CONSTRAINT \`FK_page_tags_tag_id\` FOREIGN KEY (\`tag_id\`) REFERENCES \`tags\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`page_tags\` DROP FOREIGN KEY \`FK_page_tags_tag_id\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`page_tags\` DROP FOREIGN KEY \`FK_page_tags_page_id\``,
    );
    await queryRunner.query(`DROP TABLE \`page_tags\``);
    await queryRunner.query(
      `DROP INDEX \`IDX_e7dc17249a1148a1970748eda9\` ON \`tags\``,
    );
    await queryRunner.query(`DROP TABLE \`tags\``);
  }
}
