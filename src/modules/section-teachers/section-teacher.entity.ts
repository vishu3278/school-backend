import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { Section } from '../sections/section.entity';
import { User } from '../users/user.entity';

@Entity('section_teachers')
@Index(['section', 'teacher', 'academicYear'], { unique: true })
export class SectionTeacher {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Section, (section) => section.teachers, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'section_id' })
  section: Section;

  @ManyToOne(() => User, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'teacher_id' })
  teacher: User;

  @Column({
    name: 'academic_year',
    type: 'varchar',
    length: 9,
  })
  academicYear: string;

  @Column({
    name: 'is_class_teacher',
    type: 'boolean',
    default: false,
  })
  isClassTeacher: boolean;
}
