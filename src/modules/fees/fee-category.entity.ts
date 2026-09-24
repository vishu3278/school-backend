import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

import { FeeStructure } from './fee-structure.entity';

@Entity('fee_categories')
export class FeeCategory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @OneToMany(() => FeeStructure, (feeStructure) => feeStructure.feeCategory)
  feeStructures: FeeStructure[];
}