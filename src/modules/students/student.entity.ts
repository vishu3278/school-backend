import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { Grade } from '../grades/grade.entity';

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

  @ManyToOne(() => Grade, (grade) => grade.students, {
    nullable: false,
  })
  @JoinColumn({
    name: 'grade_id',
  })
  grade: Grade;

  @CreateDateColumn({
    name: 'created_at',
  })
  createdAt: Date;

  @UpdateDateColumn({
    name: 'updated_at',
  })
  updatedAt: Date;
}
