import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAdmissionStudentAndOptionalSection1788600000002
  implements MigrationInterface
{
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "students" ALTER COLUMN "section_id" DROP NOT NULL',
    );
    await queryRunner.query(
      'ALTER TABLE "admission_applications" ADD "student_id" uuid',
    );
    await queryRunner.query(
      'ALTER TABLE "admission_applications" ADD CONSTRAINT "UQ_admission_applications_student_id" UNIQUE ("student_id")',
    );
    await queryRunner.query(
      'ALTER TABLE "admission_applications" ADD CONSTRAINT "FK_admission_applications_student" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE SET NULL ON UPDATE NO ACTION',
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "admission_applications" DROP CONSTRAINT "FK_admission_applications_student"',
    );
    await queryRunner.query(
      'ALTER TABLE "admission_applications" DROP CONSTRAINT "UQ_admission_applications_student_id"',
    );
    await queryRunner.query(
      'ALTER TABLE "admission_applications" DROP COLUMN "student_id"',
    );
    await queryRunner.query(
      'ALTER TABLE "students" ALTER COLUMN "section_id" SET NOT NULL',
    );
  }
}
