import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUserInformation1787314212846 implements MigrationInterface {
  name = 'AddUserInformation1787314212846';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" ADD "phone" character varying(30)`);
    await queryRunner.query(`ALTER TABLE "users" ADD "highest_education" character varying(150)`);
    await queryRunner.query(`ALTER TABLE "users" ADD "institution" character varying(200)`);
    await queryRunner.query(`ALTER TABLE "users" ADD "year_of_passing" character varying(4)`);
    await queryRunner.query(`ALTER TABLE "users" ADD "address" text`);
    await queryRunner.query(`ALTER TABLE "users" ADD "marital_status" character varying(30)`);
    await queryRunner.query(`ALTER TABLE "users" ADD "gender" character varying(30)`);
    await queryRunner.query(`ALTER TABLE "users" ADD "photo" text`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "photo"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "gender"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "marital_status"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "address"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "year_of_passing"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "institution"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "highest_education"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "phone"`);
  }
}