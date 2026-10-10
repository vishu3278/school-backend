import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateFeeLedger1791000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "fee_categories" ADD COLUMN "code" varchar(20)`);
    await queryRunner.query(`UPDATE "fee_categories" SET "code" = 'ADMISSION' WHERE lower(trim("name")) = 'admission'`);
    await queryRunner.query(`UPDATE "fee_categories" SET "code" = 'TUITION' WHERE lower(trim("name")) = 'tuition'`);
    await queryRunner.query(`ALTER TABLE "fee_categories" ADD CONSTRAINT "UQ_fee_categories_code" UNIQUE ("code")`);
    await queryRunner.query(`ALTER TABLE "fee_structures" ADD COLUMN "due_day" smallint`);
    await queryRunner.query(`ALTER TABLE "fee_structures" ADD CONSTRAINT "CHK_fee_structures_due_day" CHECK ("due_day" IS NULL OR "due_day" BETWEEN 1 AND 28)`);
    await queryRunner.query(`CREATE TABLE "student_fee_invoices" (
      "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "student_id" uuid NOT NULL REFERENCES "students"("id"),
      "fee_structure_id" integer NOT NULL REFERENCES "fee_structures"("id"), "academic_year_id" integer NOT NULL REFERENCES "academic_years"("id"),
      "fee_category_code" varchar(20) NOT NULL, "amount_due" numeric(10,2) NOT NULL CHECK ("amount_due" >= 0),
      "paid_amount" numeric(10,2) NOT NULL DEFAULT 0 CHECK ("paid_amount" >= 0 AND "paid_amount" <= "amount_due"),
      "billing_period" date, "due_date" date NOT NULL, "status" varchar(20) NOT NULL DEFAULT 'UNPAID',
      "created_at" timestamp NOT NULL DEFAULT now(), CONSTRAINT "PK_student_fee_invoices" PRIMARY KEY ("id"),
      CONSTRAINT "CHK_invoice_status" CHECK ("status" IN ('UNPAID', 'PARTIAL', 'PAID', 'VOID'))
    )`);
    await queryRunner.query(`CREATE UNIQUE INDEX "UQ_invoice_admission" ON "student_fee_invoices" ("student_id", "academic_year_id", "fee_category_code") WHERE "fee_category_code" = 'ADMISSION'`);
    await queryRunner.query(`CREATE UNIQUE INDEX "UQ_invoice_tuition_month" ON "student_fee_invoices" ("student_id", "academic_year_id", "fee_category_code", "billing_period") WHERE "fee_category_code" = 'TUITION'`);
    await queryRunner.query(`CREATE INDEX "IDX_invoice_student_status" ON "student_fee_invoices" ("student_id", "status")`);
    await queryRunner.query(`CREATE TABLE "fee_payments" (
      "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "invoice_id" uuid NOT NULL REFERENCES "student_fee_invoices"("id"),
      "receipt_no" varchar(50) NOT NULL UNIQUE, "amount_paid" numeric(10,2) NOT NULL CHECK ("amount_paid" > 0),
      "payment_date" date NOT NULL DEFAULT CURRENT_DATE, "payment_mode" varchar(20) NOT NULL, "transaction_ref" varchar(100),
      "collected_by" uuid NOT NULL REFERENCES "users"("id"), "remarks" varchar(255), "status" varchar(20) NOT NULL DEFAULT 'POSTED',
      "voided_by" uuid REFERENCES "users"("id"), "voided_at" timestamp, "void_reason" varchar(255), "created_at" timestamp NOT NULL DEFAULT now(),
      CONSTRAINT "PK_fee_payments" PRIMARY KEY ("id"), CONSTRAINT "CHK_payment_status" CHECK ("status" IN ('POSTED', 'VOIDED'))
    )`);
    await queryRunner.query(`CREATE INDEX "IDX_fee_payments_invoice" ON "fee_payments" ("invoice_id")`);
  }
  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE "fee_payments"'); await queryRunner.query('DROP TABLE "student_fee_invoices"');
    await queryRunner.query('ALTER TABLE "fee_structures" DROP CONSTRAINT "CHK_fee_structures_due_day"'); await queryRunner.query('ALTER TABLE "fee_structures" DROP COLUMN "due_day"');
    await queryRunner.query('ALTER TABLE "fee_categories" DROP CONSTRAINT "UQ_fee_categories_code"'); await queryRunner.query('ALTER TABLE "fee_categories" DROP COLUMN "code"');
  }
}
