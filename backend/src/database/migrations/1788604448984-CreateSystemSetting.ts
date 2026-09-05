import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateSystemSetting1788604448984 implements MigrationInterface {
  name = 'CreateSystemSetting1788604448984';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`system_setting\` (\`key\` varchar(255) NOT NULL, \`value\` varchar(255) NOT NULL, PRIMARY KEY (\`key\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `INSERT INTO \`system_setting\` (\`key\`, \`value\`) VALUES ('locale', 'fr')`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE \`system_setting\``);
  }
}
