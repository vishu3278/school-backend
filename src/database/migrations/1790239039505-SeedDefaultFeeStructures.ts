import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedDefaultFeeStructures1790239039505
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // For every grade that does not already have an annual fee structure for
    // academic year 1 and fee category 3 (e.g. Tuition), seed amount = 100.
    await queryRunner.query(`
      INSERT INTO "fee_structures" ("grade_id", "academic_year_id", "fee_category_id", "amount", "frequency")
      SELECT g."id", 1, 3, 100, 'annual'
      FROM "grades" g
      ON CONFLICT ("grade_id", "academic_year_id", "fee_category_id", "frequency") DO NOTHING
    `);

    // Same for fee category 4 (e.g. Transport), academic year 1, amount = 100.
    await queryRunner.query(`
      INSERT INTO "fee_structures" ("grade_id", "academic_year_id", "fee_category_id", "amount", "frequency")
      SELECT g."id", 1, 4, 100, 'annual'
      FROM "grades" g
      ON CONFLICT ("grade_id", "academic_year_id", "fee_category_id", "frequency") DO NOTHING
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove exactly the seed rows created by this migration.
    await queryRunner.query(`
      DELETE FROM "fee_structures"
      WHERE "academic_year_id" = 1
        AND "fee_category_id" IN (3, 4)
        AND "amount" = 100
        AND "frequency" = 'annual'
    `);
  }
}