import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { UserRole } from './user-role.enum';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

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
    unique: true,
    length: 150,
  })
  email: string;

  @Column({
    length: 255,
  })
  password: string;

  @Column({ type: 'varchar', nullable: true, length: 30 })
  phone: string | null;

  @Column({ name: 'highest_education', type: 'varchar', nullable: true, length: 150 })
  highestEducation: string | null;

  @Column({ type: 'varchar', nullable: true, length: 200 })
  institution: string | null;

  @Column({ name: 'year_of_passing', type: 'varchar', nullable: true, length: 4 })
  yearOfPassing: string | null;

  @Column({ type: 'text', nullable: true })
  address: string | null;

  @Column({ name: 'marital_status', type: 'varchar', nullable: true, length: 30 })
  maritalStatus: string | null;

  @Column({ type: 'varchar', nullable: true, length: 30 })
  gender: string | null;

  @Column({ nullable: true, type: 'text' })
  photo: string | null;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.ADMIN,
  })
  role: UserRole;

  @Column({
    name: 'is_active',
    type: 'boolean',
    default: true,
  })
  isActive: boolean;

  @UpdateDateColumn({
    name: 'updated_at',
  })
  updatedAt: Date;
}
