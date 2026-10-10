import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { AcademicYear } from '../academic-years/academic-year.entity';
import { Student } from '../students/student.entity';
import { FeeStructure } from './fee-structure.entity';

export enum InvoiceStatus {
  UNPAID = 'UNPAID',
  PARTIAL = 'PARTIAL',
  PAID = 'PAID',
  VOID = 'VOID',
}

@Entity('student_fee_invoices')
export class StudentFeeInvoice {
  @PrimaryGeneratedColumn('uuid') id: string;
  @ManyToOne(() => Student, { nullable: false })
  @JoinColumn({ name: 'student_id' })
  student: Student;
  @ManyToOne(() => FeeStructure, { nullable: false })
  @JoinColumn({ name: 'fee_structure_id' })
  feeStructure: FeeStructure;
  @ManyToOne(() => AcademicYear, { nullable: false })
  @JoinColumn({ name: 'academic_year_id' })
  academicYear: AcademicYear;
  @Column({ name: 'fee_category_code', type: 'varchar', length: 20 })
  feeCategoryCode: string;
  @Column({
    name: 'amount_due',
    type: 'numeric',
    precision: 10,
    scale: 2,
    transformer: { to: (v: unknown) => v, from: (v: unknown) => Number(v) },
  })
  amountDue: number;
  @Column({
    name: 'paid_amount',
    type: 'numeric',
    precision: 10,
    scale: 2,
    default: 0,
    transformer: { to: (v: unknown) => v, from: (v: unknown) => Number(v) },
  })
  paidAmount: number;
  @Column({ name: 'billing_period', type: 'date', nullable: true })
  billingPeriod: string | null;
  @Column({ name: 'due_date', type: 'date' }) dueDate: string;
  @Column({ type: 'varchar', length: 20, default: InvoiceStatus.UNPAID })
  status: InvoiceStatus;
  @Column({ name: 'created_at', type: 'timestamp', default: () => 'now()' })
  createdAt: Date;
}
