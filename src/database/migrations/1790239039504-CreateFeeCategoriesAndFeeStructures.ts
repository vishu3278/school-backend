import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateFeeCategoriesAndFeeStructures1790239039504
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "fee_categories" (
        "id" SERIAL PRIMARY KEY,
        "name" varchar(100) NOT NULL,
        "description" text
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "fee_structures" (
        "id" SERIAL PRIMARY KEY,
        "grade_id" uuid NOT NULL REFERENCES "grades"("id"),
        "academic_year_id" INT NOT NULL REFERENCES "academic_years"("id"),
        "fee_category_id" INT NOT NULL REFERENCES "fee_categories"("id"),
        "amount" NUMERIC(10,2) NOT NULL,
        "frequency" varchar(20) DEFAULT 'annual',
        "due_date" DATE,
        UNIQUE ("grade_id", "academic_year_id", "fee_category_id", "frequency")
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE "fee_structures"');
    await queryRunner.query('DROP TABLE "fee_categories"');
  }
}
