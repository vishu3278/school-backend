import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

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

  @OneToMany(() => Student, (student) => student.grade)
  students: Student[];
}
