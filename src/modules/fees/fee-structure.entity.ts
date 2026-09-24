import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { AcademicYear } from '../academic-years/academic-year.entity';
import { Grade } from '../grades/grade.entity';
import { FeeCategory } from './fee-category.entity';

@Entity('fee_structures')
export class FeeStructure {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Grade, {
    nullable: false,
  })
  @JoinColumn({
    name: 'grade_id',
  })
  grade: Grade;

  @ManyToOne(() => AcademicYear, {
    nullable: false,
  })
  @JoinColumn({
    name: 'academic_year_id',
  })
  academicYear: AcademicYear;

  @ManyToOne(() => FeeCategory, (feeCategory) => feeCategory.feeStructures, {
    nullable: false,
  })
  @JoinColumn({
    name: 'fee_category_id',
  })
  feeCategory: FeeCategory;

  @Column({
    type: 'numeric',
    precision: 10,
    scale: 2,
    transformer: {
      to: (value: unknown) => value,
      from: (value?: unknown) =>
        value === null || value === undefined ? null : Number(value),
    },
  })
  amount: number;

  @Column({
    type: 'varchar',
    length: 20,
    default: 'annual',
  })
  frequency: string;

  @Column({
    name: 'due_date',
    type: 'date',
    nullable: true,
  })
  dueDate: string | null;
}