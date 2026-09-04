import { MigrationInterface, QueryRunner } from "typeorm";

export class AddSectionsAndAssignments1788344618674 implements MigrationInterface {
    name = 'AddSectionsAndAssignments1788344618674'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "students" DROP CONSTRAINT "FK_students_user_id"`);
        await queryRunner.query(`CREATE TABLE "section_teachers" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "academic_year" character varying(9) NOT NULL, "is_class_teacher" boolean NOT NULL DEFAULT false, "section_id" uuid NOT NULL, "teacher_id" uuid NOT NULL, CONSTRAINT "PK_cf4588eafa16b7fd0d0642c246e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_db05db0cc9b1ad4380e740748c" ON "section_teachers"  ("section_id", "teacher_id", "academic_year") `);
        await queryRunner.query(`CREATE TABLE "sections" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(20) NOT NULL, "grade_id" uuid NOT NULL, CONSTRAINT "PK_f9749dd3bffd880a497d007e450" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_55d1a518879884fadfd212d5ef" ON "sections"  ("grade_id", "name") `);
        await queryRunner.query(`INSERT INTO "sections" ("id", "name", "grade_id") SELECT uuid_generate_v4(), 'A', g."id" FROM "grades" g LEFT JOIN "sections" s ON s."grade_id" = g."id" WHERE s."id" IS NULL`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "created_at"`);
        await queryRunner.query(`ALTER TABLE "students" ADD "section_id" uuid`);
        await queryRunner.query(`UPDATE "students" s SET "section_id" = (SELECT sec."id" FROM "sections" sec WHERE sec."grade_id" = s."grade_id" ORDER BY sec."name" ASC LIMIT 1) WHERE s."section_id" IS NULL`);
        await queryRunner.query(`ALTER TABLE "students" ALTER COLUMN "section_id" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "students" ALTER COLUMN "password" DROP DEFAULT`);
        await queryRunner.query(`ALTER TYPE "public"."religion_enum" RENAME TO "religion_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."students_religion_enum" AS ENUM('Hindu', 'Muslim', 'Sikh', 'Christian', 'Jain', 'Baudh', 'Other')`);
        await queryRunner.query(`ALTER TABLE "students" ALTER COLUMN "religion" TYPE "public"."students_religion_enum" USING "religion"::"text"::"public"."students_religion_enum"`);
        await queryRunner.query(`DROP TYPE "public"."religion_enum_old"`);
        await queryRunner.query(`ALTER TABLE "students" ADD CONSTRAINT "FK_beeea37708310f584621c6338e7" FOREIGN KEY ("grade_id") REFERENCES "grades"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "students" ADD CONSTRAINT "FK_3e1663d65a2373870a2511d6dc4" FOREIGN KEY ("section_id") REFERENCES "sections"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "students" ADD CONSTRAINT "FK_fb3eff90b11bddf7285f9b4e281" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "section_teachers" ADD CONSTRAINT "FK_9cc9fe6c2b734508c6f7709fb67" FOREIGN KEY ("section_id") REFERENCES "sections"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "section_teachers" ADD CONSTRAINT "FK_41fb22b06a92a22025fa96ee3db" FOREIGN KEY ("teacher_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "sections" ADD CONSTRAINT "FK_01ca5e044086bfeb7c29309e29c" FOREIGN KEY ("grade_id") REFERENCES "grades"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "sections" DROP CONSTRAINT "FK_01ca5e044086bfeb7c29309e29c"`);
        await queryRunner.query(`ALTER TABLE "section_teachers" DROP CONSTRAINT "FK_41fb22b06a92a22025fa96ee3db"`);
        await queryRunner.query(`ALTER TABLE "section_teachers" DROP CONSTRAINT "FK_9cc9fe6c2b734508c6f7709fb67"`);
        await queryRunner.query(`ALTER TABLE "students" DROP CONSTRAINT "FK_fb3eff90b11bddf7285f9b4e281"`);
        await queryRunner.query(`ALTER TABLE "students" DROP CONSTRAINT "FK_3e1663d65a2373870a2511d6dc4"`);
        await queryRunner.query(`ALTER TABLE "students" DROP CONSTRAINT "FK_beeea37708310f584621c6338e7"`);
        await queryRunner.query(`CREATE TYPE "public"."religion_enum_old" AS ENUM('Hindu', 'Muslim', 'Sikh', 'Christian', 'Jain', 'Baudh', 'Other')`);
        await queryRunner.query(`ALTER TABLE "students" ALTER COLUMN "religion" TYPE "public"."religion_enum_old" USING "religion"::"text"::"public"."religion_enum_old"`);
        await queryRunner.query(`DROP TYPE "public"."students_religion_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."religion_enum_old" RENAME TO "religion_enum"`);
        await queryRunner.query(`ALTER TABLE "students" ALTER COLUMN "password" SET DEFAULT 'password123'`);
        await queryRunner.query(`ALTER TABLE "students" DROP COLUMN "section_id"`);
        await queryRunner.query(`ALTER TABLE "users" ADD "created_at" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`DROP INDEX "public"."IDX_55d1a518879884fadfd212d5ef"`);
        await queryRunner.query(`DROP TABLE "sections"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_db05db0cc9b1ad4380e740748c"`);
        await queryRunner.query(`DROP TABLE "section_teachers"`);
        await queryRunner.query(`ALTER TABLE "students" ADD CONSTRAINT "FK_students_user_id" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE`);
    }

}
