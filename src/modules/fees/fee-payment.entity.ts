import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../users/user.entity';
import { StudentFeeInvoice } from './student-fee-invoice.entity';

export enum PaymentStatus {
  POSTED = 'POSTED',
  VOIDED = 'VOIDED',
}
@Entity('fee_payments')
export class FeePayment {
  @PrimaryGeneratedColumn('uuid') id: string;
  @ManyToOne(() => StudentFeeInvoice, { nullable: false })
  @JoinColumn({ name: 'invoice_id' })
  invoice: StudentFeeInvoice;
  @Column({ name: 'receipt_no', unique: true, length: 50 }) receiptNo: string;
  @Column({
    name: 'amount_paid',
    type: 'numeric',
    precision: 10,
    scale: 2,
    transformer: { to: (v: unknown) => v, from: (v: unknown) => Number(v) },
  })
  amountPaid: number;
  @Column({ name: 'payment_date', type: 'date' }) paymentDate: string;
  @Column({ name: 'payment_mode', type: 'varchar', length: 20 })
  paymentMode: string;
  @Column({
    name: 'transaction_ref',
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  transactionRef: string | null;
  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'collected_by' })
  collectedBy: User;
  @Column({ type: 'varchar', length: 255, nullable: true }) remarks:
    string | null;
  @Column({ type: 'varchar', length: 20, default: PaymentStatus.POSTED })
  status: PaymentStatus;
  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'voided_by' })
  voidedBy: User | null;
  @Column({ name: 'voided_at', type: 'timestamp', nullable: true })
  voidedAt: Date | null;
  @Column({ name: 'void_reason', type: 'varchar', length: 255, nullable: true })
  voidReason: string | null;
  @Column({ name: 'created_at', type: 'timestamp', default: () => 'now()' })
  createdAt: Date;
}
