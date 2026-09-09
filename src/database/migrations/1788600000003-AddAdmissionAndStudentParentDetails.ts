import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAdmissionAndStudentParentDetails1788600000003
  implements MigrationInterface
{
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "admission_applications"
        ADD COLUMN "religion" varchar(30),
        ADD COLUMN "address" text
    `);
    await queryRunner.query(`
      ALTER TABLE "students"
        ADD COLUMN "father_aadhar_no" varchar(20),
        ADD COLUMN "mother_aadhar_no" varchar(20),
        ADD COLUMN "father_occupation" varchar(100),
        ADD COLUMN "mother_occupation" varchar(100)
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "students"
        DROP COLUMN "mother_occupation",
        DROP COLUMN "father_occupation",
        DROP COLUMN "mother_aadhar_no",
        DROP COLUMN "father_aadhar_no"
    `);
    await queryRunner.query(`
      ALTER TABLE "admission_applications"
        DROP COLUMN "address",
        DROP COLUMN "religion"
    `);
  }
}
