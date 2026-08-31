import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1787314212842 implements MigrationInterface {
    name = 'InitialSchema1787314212842'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "students" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "admission_no" character varying(50) NOT NULL, "first_name" character varying(100) NOT NULL, "last_name" character varying(100) NOT NULL, "date_of_birth" date, "gender" character varying(20), "phone" character varying(20), "email" character varying(150), "address" text, "grade_id" uuid NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_60be61f5398fa190f5808f0bc03" UNIQUE ("admission_no"), CONSTRAINT "PK_7d7f07271ad4ce999880713f05e" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "students"`);
    }

}
