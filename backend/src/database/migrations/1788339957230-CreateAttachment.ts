import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateAttachment1788339957230 implements MigrationInterface {
  name = 'CreateAttachment1788339957230';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`attachments\` (\`id\` varchar(36) NOT NULL, \`page_id\` varchar(36) NULL, \`minio_key\` varchar(500) NOT NULL, \`filename\` varchar(255) NOT NULL, \`mime_type\` varchar(100) NOT NULL, \`size\` int NOT NULL, \`uploaded_by_id\` varchar(36) NOT NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), INDEX \`IDX_3a4e6644cdafd6f555a330800b\` (\`page_id\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX \`IDX_3a4e6644cdafd6f555a330800b\` ON \`attachments\``,
    );
    await queryRunner.query(`DROP TABLE \`attachments\``);
  }
}
