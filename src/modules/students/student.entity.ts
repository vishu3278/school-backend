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
import { User } from '../users/user.entity';

export enum Religion {
  HINDU = 'Hindu',
  MUSLIM = 'Muslim',
  SIKH = 'Sikh',
  CHRISTIAN = 'Christian',
  JAIN = 'Jain',
  BUDDHIST = 'Baudh',
  OTHER = 'Other',
}

@Entity('students')
export class Student {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    name: 'admission_no',
    unique: true,
    length: 50,
  })
  admissionNo: string;

  @Column({
    name: 'first_name',
    length: 100,
  })
  firstName: string;

  @Column({
    name: 'last_name',
    length: 100,
  })
  lastName: string;

  @Column({
    name: 'date_of_birth',
    type: 'date',
    nullable: true,
  })
  dateOfBirth: string | null;

  @Column({
    type: 'varchar',
    length: 20,
    nullable: true,
  })
  gender: string | null;

  @Column({
    type: 'varchar',
    length: 20,
    nullable: true,
  })
  phone: string | null;

  @Column({
    name: 'phone2',
    type: 'varchar',
    length: 20,
    nullable: true,
  })
  phone2: string | null;

  @Column({
    type: 'varchar',
    length: 150,
    nullable: true,
  })
  email: string | null;

  @Column({
    type: 'text',
    nullable: true,
  })
  address: string | null;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  password: string | null;

  @Column({
    name: 'mother_name',
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  motherName: string | null;

  @Column({
    name: 'father_name',
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  fatherName: string | null;

  @Column({
    name: 'aadhar_no',
    type: 'varchar',
    length: 20,
    nullable: true,
  })
  aadharNo: string | null;

  @Column({
    name: 'religion',
    type: 'enum',
    enum: Religion,
    nullable: true,
  })
  religion: Religion | null;

  @ManyToOne(() => Grade, (grade) => grade.students, {
    nullable: false,
  })
  @JoinColumn({
    name: 'grade_id',
  })
  grade: Grade;

  @ManyToOne(() => User, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({
    name: 'user_id',
  })
  user?: User | null;

  @CreateDateColumn({
    name: 'created_at',
  })
  createdAt: Date;

  @UpdateDateColumn({
    name: 'updated_at',
  })
  updatedAt: Date;
}
