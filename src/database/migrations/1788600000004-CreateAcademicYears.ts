import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateAcademicYears1788600000004 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "academic_years" (
        "id" SERIAL PRIMARY KEY,
        "name" varchar(20) NOT NULL,
        "start_date" date NOT NULL,
        "end_date" date NOT NULL,
        "is_current" boolean DEFAULT false
      )
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE "academic_years"');
  }
}
