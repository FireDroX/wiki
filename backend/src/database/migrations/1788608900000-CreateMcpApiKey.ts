import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateMcpApiKey1788608900000 implements MigrationInterface {
  name = 'CreateMcpApiKey1788608900000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`mcp_api_keys\` (\`id\` varchar(36) NOT NULL, \`name\` varchar(255) NOT NULL, \`key_hash\` varchar(255) NOT NULL, \`scopes\` json NOT NULL, \`created_by_id\` varchar(36) NOT NULL, \`last_used_at\` datetime NULL, \`revoked_at\` datetime NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), UNIQUE INDEX \`IDX_mcp_api_keys_key_hash\` (\`key_hash\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX \`IDX_mcp_api_keys_key_hash\` ON \`mcp_api_keys\``,
    );
    await queryRunner.query(`DROP TABLE \`mcp_api_keys\``);
  }
}
