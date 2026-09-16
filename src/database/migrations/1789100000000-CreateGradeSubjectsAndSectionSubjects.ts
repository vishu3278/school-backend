import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateGradeSubjectsAndSectionSubjects1789100000000 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "grade_subjects" (
        "id" SERIAL PRIMARY KEY,
        "grade_id" uuid NOT NULL REFERENCES "grades"("id"),
        "subject_id" INT NOT NULL REFERENCES "subjects"("id"),
        "academic_year_id" INT NOT NULL REFERENCES "academic_years"("id"),
        "is_elective" BOOLEAN DEFAULT FALSE,
        UNIQUE ("grade_id", "subject_id", "academic_year_id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "section_subjects" (
        "id" SERIAL PRIMARY KEY,
        "section_id" uuid NOT NULL REFERENCES "sections"("id"),
        "subject_id" INT NOT NULL REFERENCES "subjects"("id"),
        "teacher_id" uuid REFERENCES "users"("id"),
        UNIQUE ("section_id", "subject_id")
      )
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE "section_subjects"');
    await queryRunner.query('DROP TABLE "grade_subjects"');
  }
}
