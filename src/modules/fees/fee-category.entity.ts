import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

import { FeeStructure } from './fee-structure.entity';

export enum FeeCategoryCode {
  ADMISSION = 'ADMISSION',
  TUITION = 'TUITION',
}

@Entity('fee_categories')
export class FeeCategory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  name: string;

  @Column({ name: 'code', type: 'varchar', length: 20, nullable: true, unique: true })
  code: FeeCategoryCode | null;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @OneToMany(() => FeeStructure, (feeStructure) => feeStructure.feeCategory)
  feeStructures: FeeStructure[];
}
