import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateAdmissionApplications1788600000000 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "admission_applications" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "application_no" varchar(50) NOT NULL,
        "first_name" varchar(100) NOT NULL,
        "last_name" varchar(100) NOT NULL,
        "date_of_birth" date NOT NULL,
        "gender" varchar(20), "father_name" varchar(150), "mother_name" varchar(150),
        "phone1" varchar(20), "phone2" varchar(20), "email" varchar(150),
        "previous_school" varchar(150), "previous_grade" varchar(50), "previous_result" text,
        "academic_year" varchar(20) NOT NULL, "requested_grade_id" uuid NOT NULL,
        "birth_certificate_received" boolean NOT NULL DEFAULT false,
        "transfer_certificate_received" boolean NOT NULL DEFAULT false,
        "previous_marksheet_received" boolean NOT NULL DEFAULT false,
        "photos_received" boolean NOT NULL DEFAULT false,
        "status" varchar(20) NOT NULL DEFAULT 'DRAFT',
        "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_admission_applications" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_admission_applications_application_no" UNIQUE ("application_no"),
        CONSTRAINT "FK_admission_applications_requested_grade" FOREIGN KEY ("requested_grade_id") REFERENCES "grades"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
      )
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE "admission_applications"');
  }
}
