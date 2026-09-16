import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateSubjects1789000000000 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "subjects" (
        "id" SERIAL PRIMARY KEY,
        "name" VARCHAR(100) NOT NULL,
        "code" VARCHAR(20) UNIQUE,
        "is_elective" BOOLEAN DEFAULT FALSE
      )
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE "subjects"');
  }
}
