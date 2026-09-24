import { MigrationInterface, QueryRunner } from "typeorm";

export class AddStudentRollNo1790239039503 implements MigrationInterface {
  name = 'AddStudentRollNo1790239039503';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "students"
      ADD "roll_no" character varying(50)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "students"
      DROP COLUMN "roll_no"
    `);
  }
}