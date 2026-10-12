import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';
import { AcademicYear } from '../academic-years/academic-year.entity';
import { Grade } from '../grades/grade.entity';
import { Student } from '../students/student.entity';
import { User } from '../users/user.entity';
import { FeeCategoryCode } from './fee-category.entity';
import { FeePayment, PaymentStatus } from './fee-payment.entity';
import { FeeStructure } from './fee-structure.entity';
import { InvoiceStatus, StudentFeeInvoice } from './student-fee-invoice.entity';
import { CreateFeePaymentDto } from './dto/create-fee-payment.dto';
import { CreateCustomFeeInvoiceDto } from './dto/create-custom-fee-invoice.dto';

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
    manager: EntityManager,
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
    const missingConfiguration: string[] = [];
    if (!admission) {
      missingConfiguration.push(
        'an Admission category with a one_time fee structure',
      );
    }
    if (!tuition) {
      missingConfiguration.push(
        'a Tuition category with a monthly fee structure',
      );
    } else if (!tuition.dueDay) {
      missingConfiguration.push('a monthly Tuition due day (1–28)');
    }
    if (missingConfiguration.length) {
      throw new ConflictException(
        `Missing fee setup for this grade and academic year: ${missingConfiguration.join(', ')}.`,
      );
    }
    const invoices = manager.getRepository(StudentFeeInvoice);
    const hasAdmissionInvoice = await invoices.exists({
      where: {
        student: { id: student.id },
        academicYear: { id: academicYear.id },
        feeCategoryCode: FeeCategoryCode.ADMISSION,
      },
    });
    if (!hasAdmissionInvoice) {
      await invoices.insert({
        student,
        feeStructure: admission!,
        academicYear,
        feeCategoryCode: FeeCategoryCode.ADMISSION,
        amountDue: admission!.amount,
        paidAmount: 0,
        billingPeriod: null,
        dueDate: admission!.dueDate ?? academicYear.startDate,
        status: InvoiceStatus.UNPAID,
      });
    }
    for (const period of monthsOverlapping(
      academicYear.startDate,
      academicYear.endDate,
    )) {
      const [year, month] = period.split('-').map(Number);
      const billingPeriod = `${period}-01`;
      const hasTuitionInvoice = await invoices.exists({
        where: {
          student: { id: student.id },
          academicYear: { id: academicYear.id },
          feeCategoryCode: FeeCategoryCode.TUITION,
          billingPeriod,
        },
      });
      if (!hasTuitionInvoice) {
        await invoices.insert({
          student,
          feeStructure: tuition!,
          academicYear,
          feeCategoryCode: FeeCategoryCode.TUITION,
          amountDue: tuition!.amount,
          paidAmount: 0,
          billingPeriod,
          dueDate: `${period}-${String(Math.min(tuition!.dueDay!, new Date(Date.UTC(year, month, 0)).getUTCDate())).padStart(2, '0')}`,
          status: InvoiceStatus.UNPAID,
        });
      }
    }
  }

  async generateInvoicesForStudent(
    studentId: string,
    academicYearId: number,
  ): Promise<void> {
    await this.dataSource.transaction(async (manager) => {
      const student = await manager.getRepository(Student).findOne({
        where: { id: studentId },
        relations: { grade: true },
      });
      if (!student) throw new NotFoundException('Student not found');
      const academicYear = await manager
        .getRepository(AcademicYear)
        .findOneBy({ id: academicYearId });
      if (!academicYear) throw new NotFoundException('Academic year not found');
      await this.createInvoicesForApprovedStudent(
        manager,
        student,
        student.grade,
        academicYear,
      );
    });
  }

  async availableOtherFeeStructures(studentId: string, academicYearId: number) {
    const student = await this.dataSource.getRepository(Student).findOne({
      where: { id: studentId },
      relations: { grade: true },
    });
    if (!student) throw new NotFoundException('Student not found');
    const structures = await this.dataSource.getRepository(FeeStructure).find({
      where: {
        grade: { id: student.grade.id },
        academicYear: { id: academicYearId },
      },
      relations: { feeCategory: true },
      order: { feeCategory: { name: 'ASC' } },
    });
    return structures
      .filter((structure) => !structure.feeCategory.code)
      .map((structure) => ({
        id: structure.id,
        categoryName: structure.feeCategory.name,
        amount: structure.amount,
        frequency: structure.frequency,
        dueDate: structure.dueDate,
      }));
  }

  async createOtherFeeInvoice(
    studentId: string,
    dto: CreateCustomFeeInvoiceDto,
  ): Promise<StudentFeeInvoice> {
    return this.dataSource.transaction(async (manager) => {
      const student = await manager.getRepository(Student).findOne({
        where: { id: studentId },
        relations: { grade: true },
      });
      if (!student) throw new NotFoundException('Student not found');
      const structure = await manager.getRepository(FeeStructure).findOne({
        where: { id: dto.feeStructureId },
        relations: { feeCategory: true, academicYear: true, grade: true },
      });
      if (!structure) throw new NotFoundException('Fee structure not found');
      if (structure.grade.id !== student.grade.id) {
        throw new BadRequestException('This fee structure does not apply to the student grade');
      }
      if (structure.feeCategory.code) {
        throw new BadRequestException('Admission and Tuition invoices are generated separately');
      }
      const invoice = manager.getRepository(StudentFeeInvoice).create({
        student,
        feeStructure: structure,
        academicYear: structure.academicYear,
        feeCategoryCode: `CATEGORY_${structure.feeCategory.id}`,
        amountDue: structure.amount,
        paidAmount: 0,
        billingPeriod: null,
        dueDate: dto.dueDate ?? structure.dueDate ?? dateOnly(new Date()),
        status: InvoiceStatus.UNPAID,
      });
      return manager.getRepository(StudentFeeInvoice).save(invoice);
    });
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
      feeCategoryName: i.feeStructure.feeCategory.name,
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
