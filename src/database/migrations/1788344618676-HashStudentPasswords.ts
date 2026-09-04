import * as bcrypt from 'bcryptjs';
import { MigrationInterface, QueryRunner } from 'typeorm';

export class HashStudentPasswords1788344618676 implements MigrationInterface {
  name = 'HashStudentPasswords1788344618676';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const students: Array<{ id: string; password: string | null }> = await queryRunner.query(
      `SELECT "id", "password" FROM "students" WHERE "password" IS NOT NULL`,
    );

    for (const student of students) {
      if (!student.password?.startsWith('$2')) {
        const passwordHash = await bcrypt.hash(student.password ?? '', 10);
        await queryRunner.query(
          `UPDATE "students" SET "password" = $1 WHERE "id" = $2`,
          [passwordHash, student.id],
        );
      }
    }
  }

  public async down(): Promise<void> {
    // Password hashes cannot be safely converted back to plaintext.
  }
}