import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateGradesTable1787314212843 implements MigrationInterface {
  name = 'CreateGradesTable1787314212843';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "grades" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" character varying(50) NOT NULL,
        CONSTRAINT "PK_9188b8d0c7f9d2d4af3d3b8ad0e" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_grades_name" UNIQUE ("name")
      )
    `);

    await queryRunner.query(`
      INSERT INTO "grades" ("id", "name") VALUES
      ('11111111-1111-4111-8111-111111111111', 'Grade 1'),
      ('22222222-2222-4222-8222-222222222222', 'Grade 2'),
      ('33333333-3333-4333-8333-333333333333', 'Grade 3')
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DELETE FROM "grades"
      WHERE "id" IN (
        '11111111-1111-4111-8111-111111111111',
        '22222222-2222-4222-8222-222222222222',
        '33333333-3333-4333-8333-333333333333'
      )
    `);

    await queryRunner.query(`DROP TABLE "grades"`);
  }
}
