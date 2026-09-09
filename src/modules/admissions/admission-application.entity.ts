import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { Grade } from '../grades/grade.entity';
import { Religion, Student } from '../students/student.entity';

export enum AdmissionStatus {
  DRAFT = 'DRAFT',
  SUBMITTED = 'SUBMITTED',
  UNDER_REVIEW = 'UNDER_REVIEW',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  WAITLISTED = 'WAITLISTED',
  CANCELLED = 'CANCELLED',
}

@Entity('admission_applications')
export class AdmissionApplication {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'application_no', unique: true, length: 50 })
  applicationNo: string;

  @Column({ name: 'first_name', length: 100 })
  firstName: string;

  @Column({ name: 'last_name', length: 100 })
  lastName: string;

  @Column({ name: 'date_of_birth', type: 'date' })
  dateOfBirth: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  gender: string | null;

  @Column({ name: 'father_name', type: 'varchar', length: 150, nullable: true })
  fatherName: string | null;

  @Column({ name: 'mother_name', type: 'varchar', length: 150, nullable: true })
  motherName: string | null;

  @Column({ name: 'student_aadhar_no', type: 'varchar', length: 20, nullable: true })
  studentAadharNo: string | null;

  @Column({ name: 'father_aadhar_no', type: 'varchar', length: 20 })
  fatherAadharNo: string;

  @Column({ name: 'mother_aadhar_no', type: 'varchar', length: 20 })
  motherAadharNo: string;

  @Column({ name: 'father_occupation', type: 'varchar', length: 100, nullable: true })
  fatherOccupation: string | null;

  @Column({ name: 'mother_occupation', type: 'varchar', length: 100, nullable: true })
  motherOccupation: string | null;

  @Column({ type: 'varchar', length: 30, nullable: true })
  religion: Religion | null;

  @Column({ type: 'text', nullable: true })
  address: string | null;

  @Column({ name: 'phone1', type: 'varchar', length: 20, nullable: true })
  phone1: string | null;

  @Column({ name: 'phone2', type: 'varchar', length: 20, nullable: true })
  phone2: string | null;

  @Column({ type: 'varchar', length: 150, nullable: true })
  email: string | null;

  @Column({ name: 'previous_school', type: 'varchar', length: 150, nullable: true })
  previousSchool: string | null;

  @Column({ name: 'previous_grade', type: 'varchar', length: 50, nullable: true })
  previousGrade: string | null;

  @Column({ name: 'previous_result', type: 'text', nullable: true })
  previousResult: string | null;

  @Column({ name: 'academic_year', length: 20 })
  academicYear: string;

  @ManyToOne(() => Grade, { nullable: false })
  @JoinColumn({ name: 'requested_grade_id' })
  requestedGrade: Grade;

  @Column({ name: 'birth_certificate_received', type: 'boolean', default: false })
  birthCertificateReceived: boolean;

  @Column({ name: 'transfer_certificate_received', type: 'boolean', default: false })
  transferCertificateReceived: boolean;

  @Column({ name: 'previous_marksheet_received', type: 'boolean', default: false })
  previousMarksheetReceived: boolean;

  @Column({ name: 'photos_received', type: 'boolean', default: false })
  photosReceived: boolean;

  @Column({ type: 'varchar', length: 20, default: AdmissionStatus.DRAFT })
  status: AdmissionStatus;

  @OneToOne(() => Student, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'student_id' })
  student: Student | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
