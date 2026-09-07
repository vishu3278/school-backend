import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAdmissionAadharAndOccupations1788600000001 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "admission_applications"
        ADD COLUMN "student_aadhar_no" varchar(20),
        ADD COLUMN "father_aadhar_no" varchar(20) NOT NULL DEFAULT '',
        ADD COLUMN "mother_aadhar_no" varchar(20) NOT NULL DEFAULT '',
        ADD COLUMN "father_occupation" varchar(100),
        ADD COLUMN "mother_occupation" varchar(100)
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "admission_applications"
        DROP COLUMN "mother_occupation",
        DROP COLUMN "father_occupation",
        DROP COLUMN "mother_aadhar_no",
        DROP COLUMN "father_aadhar_no",
        DROP COLUMN "student_aadhar_no"
    `);
  }
}
