import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

import { Section } from '../sections/section.entity';
import { Student } from '../students/student.entity';

@Entity('grades')
export class Grade {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    unique: true,
    length: 50,
  })
  name: string;

  @OneToMany(() => Section, (section) => section.grade)
  sections: Section[];

  @OneToMany(() => Student, (student) => student.grade)
  students: Student[];
}
