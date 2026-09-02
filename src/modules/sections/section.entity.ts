import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { Grade } from '../grades/grade.entity';
import { Student } from '../students/student.entity';
import { SectionTeacher } from '../section-teachers/section-teacher.entity';

@Entity('sections')
@Index(['grade', 'name'], { unique: true })
export class Section {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'varchar',
    length: 20,
  })
  name: string;

  @ManyToOne(() => Grade, (grade) => grade.sections, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'grade_id',
  })
  grade: Grade;

  @OneToMany(() => Student, (student) => student.section)
  students: Student[];

  @OneToMany(() => SectionTeacher, (sectionTeacher) => sectionTeacher.section)
  teachers: SectionTeacher[];
}
