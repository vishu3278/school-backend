import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import { AcademicYear } from '../academic-years/academic-year.entity';
import { Grade } from '../grades/grade.entity';
import { Student } from '../students/student.entity';
import { User } from '../users/user.entity';
import { FeeCategoryCode } from './fee-category.entity';
import { FeePayment, PaymentStatus } from './fee-payment.entity';
import { FeeStructure } from './fee-structure.entity';
import { InvoiceStatus, StudentFeeInvoice } from './student-fee-invoice.entity';
import { CreateFeePaymentDto } from './dto/create-fee-payment.dto';

const dateOnly = (date: Date) => date.toISOString().slice(0, 10);
const invoiceStatus = (due: number, paid: number): InvoiceStatus =>
  paid === 0
    ? InvoiceStatus.UNPAID
    : paid === due
      ? InvoiceStatus.PAID
      : InvoiceStatus.PARTIAL;

@Injectable()
export class FeeLedgerService {
  constructor(private readonly dataSource: DataSource) {}

  async createInvoicesForApprovedStudent(
    manager: any,
    student: Student,
    grade: Grade,
    academicYear: AcademicYear,
  ): Promise<void> {
    const structures = await manager.getRepository(FeeStructure).find({
      where: { grade: { id: grade.id }, academicYear: { id: academicYear.id } },
      relations: { feeCategory: true },
    });
    const admission = structures.find(
      (s) =>
        s.feeCategory.code === FeeCategoryCode.ADMISSION &&
        s.frequency === 'one_time',
    );
    const tuition = structures.find(
      (s) =>
        s.feeCategory.code === FeeCategoryCode.TUITION &&
        s.frequency === 'monthly',
    );
    if (!admission || !tuition || !tuition.dueDay)
      throw new ConflictException(
        'Admission and monthly tuition fee structures must be configured for the selected grade and academic year',
      );
    const invoices = manager.getRepository(StudentFeeInvoice);
    await invoices.insert({
      student,
      feeStructure: admission,
      academicYear,
      feeCategoryCode: FeeCategoryCode.ADMISSION,
      amountDue: admission.amount,
      paidAmount: 0,
      billingPeriod: null,
      dueDate: admission.dueDate ?? academicYear.startDate,
      status: InvoiceStatus.UNPAID,
    });
    for (const period of monthsOverlapping(
      academicYear.startDate,
      academicYear.endDate,
    )) {
      const [year, month] = period.split('-').map(Number);
      await invoices.insert({
        student,
        feeStructure: tuition,
        academicYear,
        feeCategoryCode: FeeCategoryCode.TUITION,
        amountDue: tuition.amount,
        paidAmount: 0,
        billingPeriod: `${period}-01`,
        dueDate: `${period}-${String(Math.min(tuition.dueDay, new Date(Date.UTC(year, month, 0)).getUTCDate())).padStart(2, '0')}`,
        status: InvoiceStatus.UNPAID,
      });
    }
  }

  async listInvoices(studentId?: string) {
    const rows = await this.dataSource
      .getRepository(StudentFeeInvoice)
      .createQueryBuilder('i')
      .leftJoinAndSelect('i.student', 'student')
      .leftJoinAndSelect('i.feeStructure', 'structure')
      .leftJoinAndSelect('structure.feeCategory', 'category')
      .where(studentId ? 'i.student_id = :studentId' : '1=1', { studentId })
      .orderBy('i.due_date', 'ASC')
      .getMany();
    const today = dateOnly(new Date());
    return rows.map((i) => ({
      ...i,
      remainingAmount: Number((i.amountDue - i.paidAmount).toFixed(2)),
      isOverdue:
        i.status !== InvoiceStatus.PAID &&
        i.status !== InvoiceStatus.VOID &&
        i.dueDate < today,
    }));
  }

  async paymentHistory(invoiceId: string) {
    return this.dataSource.getRepository(FeePayment).find({
      where: { invoice: { id: invoiceId } },
      relations: { collectedBy: true, voidedBy: true },
      order: { createdAt: 'DESC' },
    });
  }

  async collectPayment(dto: CreateFeePaymentDto, userId: string) {
    return this.dataSource.transaction(async (manager) => {
      const invoices = manager.getRepository(StudentFeeInvoice);
      const invoice = await invoices.findOne({
        where: { id: dto.invoiceId },
        lock: { mode: 'pessimistic_write' },
      });
      if (!invoice) throw new NotFoundException('Invoice not found');
      if (
        invoice.status === InvoiceStatus.VOID ||
        invoice.status === InvoiceStatus.PAID
      )
        throw new BadRequestException('This invoice cannot receive a payment');
      const remaining = Number(
        (invoice.amountDue - invoice.paidAmount).toFixed(2),
      );
      if (dto.amount > remaining)
        throw new BadRequestException(
          `Payment exceeds remaining balance of ${remaining}`,
        );
      const payment = manager.getRepository(FeePayment).create({
        invoice,
        receiptNo: `RCP-${Date.now()}-${crypto.randomUUID().slice(0, 8).toUpperCase()}`,
        amountPaid: dto.amount,
        paymentDate: dto.paymentDate ?? dateOnly(new Date()),
        paymentMode: dto.paymentMode,
        transactionRef: dto.transactionRef?.trim() || null,
        collectedBy: { id: userId } as User,
        remarks: dto.remarks?.trim() || null,
        status: PaymentStatus.POSTED,
      });
      await manager.getRepository(FeePayment).save(payment);
      invoice.paidAmount = Number((invoice.paidAmount + dto.amount).toFixed(2));
      invoice.status = invoiceStatus(invoice.amountDue, invoice.paidAmount);
      await invoices.save(invoice);
      return payment;
    });
  }

  async voidPayment(paymentId: string, reason: string, userId: string) {
    return this.dataSource.transaction(async (manager) => {
      const payments = manager.getRepository(FeePayment);
      const payment = await payments.findOne({
        where: { id: paymentId },
        relations: { invoice: true },
        lock: { mode: 'pessimistic_write' },
      });
      if (!payment) throw new NotFoundException('Payment not found');
      if (payment.status === PaymentStatus.VOIDED)
        throw new BadRequestException('Payment is already voided');
      const invoice = await manager.getRepository(StudentFeeInvoice).findOne({
        where: { id: payment.invoice.id },
        lock: { mode: 'pessimistic_write' },
      });
      if (!invoice) throw new NotFoundException('Invoice not found');
      payment.status = PaymentStatus.VOIDED;
      payment.voidedBy = { id: userId } as User;
      payment.voidedAt = new Date();
      payment.voidReason = reason.trim();
      await payments.save(payment);
      invoice.paidAmount = Number(
        (invoice.paidAmount - payment.amountPaid).toFixed(2),
      );
      invoice.status = invoiceStatus(invoice.amountDue, invoice.paidAmount);
      await manager.getRepository(StudentFeeInvoice).save(invoice);
      return payment;
    });
  }
}

function monthsOverlapping(start: string, end: string): string[] {
  const cursor = new Date(`${start}T00:00:00Z`);
  cursor.setUTCDate(1);
  const last = new Date(`${end}T00:00:00Z`);
  last.setUTCDate(1);
  const result: string[] = [];
  while (cursor <= last) {
    result.push(
      `${cursor.getUTCFullYear()}-${String(cursor.getUTCMonth() + 1).padStart(2, '0')}`,
    );
    cursor.setUTCMonth(cursor.getUTCMonth() + 1);
  }
  return result;
}
