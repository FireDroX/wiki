import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateMcpAuditLog1788611600000 implements MigrationInterface {
  name = 'CreateMcpAuditLog1788611600000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`mcp_audit_logs\` (\`id\` varchar(36) NOT NULL, \`api_key_id\` varchar(36) NOT NULL, \`tool_name\` varchar(255) NOT NULL, \`input\` json NOT NULL, \`output\` json NULL, \`success\` tinyint NOT NULL, \`error_message\` varchar(1000) NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), INDEX \`IDX_mcp_audit_logs_api_key_id\` (\`api_key_id\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX \`IDX_mcp_audit_logs_api_key_id\` ON \`mcp_audit_logs\``,
    );
    await queryRunner.query(`DROP TABLE \`mcp_audit_logs\``);
  }
}
