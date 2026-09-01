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
