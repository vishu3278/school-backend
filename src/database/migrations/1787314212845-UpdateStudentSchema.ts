import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateStudentSchema1787314212845 implements MigrationInterface {
  name = 'UpdateStudentSchema1787314212845';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create religion enum type
    await queryRunner.query(`
      CREATE TYPE "religion_enum" AS ENUM ('Hindu', 'Muslim', 'Sikh', 'Christian', 'Jain', 'Baudh', 'Other')
    `);

    // Update users role enum to remove 'student'
    await queryRunner.query(`
      ALTER TYPE "users_role_enum" RENAME TO "users_role_enum_old"
    `);

    await queryRunner.query(`
      CREATE TYPE "users_role_enum" AS ENUM ('admin', 'teacher', 'staff')
    `);

    await queryRunner.query(`
      ALTER TABLE "users"
      ALTER COLUMN "role" DROP DEFAULT
    `);

    await queryRunner.query(`
      ALTER TABLE "users"
      ALTER COLUMN "role" TYPE "users_role_enum" USING role::"text"::"users_role_enum"
    `);

    await queryRunner.query(`
      ALTER TABLE "users"
      ALTER COLUMN "role" SET DEFAULT 'admin'
    `);

    await queryRunner.query(`
      DROP TYPE "users_role_enum_old"
    `);

    // Add new columns to students table
    await queryRunner.query(`
      ALTER TABLE "students"
      ADD "password" character varying(255) DEFAULT 'password123'
    `);

    await queryRunner.query(`
      ALTER TABLE "students"
      ADD "phone2" character varying(20)
    `);

    await queryRunner.query(`
      ALTER TABLE "students"
      ADD "mother_name" character varying(100)
    `);

    await queryRunner.query(`
      ALTER TABLE "students"
      ADD "father_name" character varying(100)
    `);

    await queryRunner.query(`
      ALTER TABLE "students"
      ADD "aadhar_no" character varying(20)
    `);

    await queryRunner.query(`
      ALTER TABLE "students"
      ADD "religion" "religion_enum"
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove columns from students table
    await queryRunner.query(`
      ALTER TABLE "students"
      DROP COLUMN "religion"
    `);

    await queryRunner.query(`
      ALTER TABLE "students"
      DROP COLUMN "aadhar_no"
    `);

    await queryRunner.query(`
      ALTER TABLE "students"
      DROP COLUMN "father_name"
    `);

    await queryRunner.query(`
      ALTER TABLE "students"
      DROP COLUMN "mother_name"
    `);

    await queryRunner.query(`
      ALTER TABLE "students"
      DROP COLUMN "phone2"
    `);

    await queryRunner.query(`
      ALTER TABLE "students"
      DROP COLUMN "password"
    `);

    // Revert users role enum
    await queryRunner.query(`
      ALTER TYPE "users_role_enum" RENAME TO "users_role_enum_old"
    `);

    await queryRunner.query(`
      CREATE TYPE "users_role_enum" AS ENUM ('admin', 'teacher', 'student', 'staff')
    `);

    await queryRunner.query(`
      ALTER TABLE "users"
      ALTER COLUMN "role" DROP DEFAULT
    `);

    await queryRunner.query(`
      ALTER TABLE "users"
      ALTER COLUMN "role" TYPE "users_role_enum" USING role::"text"::"users_role_enum"
    `);

    await queryRunner.query(`
      ALTER TABLE "users"
      ALTER COLUMN "role" SET DEFAULT 'student'
    `);

    await queryRunner.query(`
      DROP TYPE "users_role_enum_old"
    `);

    // Drop religion enum
    await queryRunner.query(`
      DROP TYPE "religion_enum"
    `);
  }
}
