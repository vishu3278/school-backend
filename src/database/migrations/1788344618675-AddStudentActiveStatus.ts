import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddStudentActiveStatus1788344618675 implements MigrationInterface {
  name = 'AddStudentActiveStatus1788344618675';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "students"
      ADD "is_active" boolean NOT NULL DEFAULT true
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "students"
      DROP COLUMN "is_active"
    `);
  }
}