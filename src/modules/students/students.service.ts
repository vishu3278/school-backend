import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { Grade } from '../grades/grade.entity';

import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';

import { Student } from './student.entity';

@Injectable()
export class StudentsService {
  constructor(
    @InjectRepository(Student)
    private readonly studentRepository: Repository<Student>,

    @InjectRepository(Grade)
    private readonly gradeRepository: Repository<Grade>,
  ) {}

  async findAll(): Promise<Student[]> {
    return this.studentRepository.find({
      relations: {
        grade: true,
      },
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async findOne(id: string): Promise<Student> {
    const student = await this.studentRepository.findOne({
      where: { id },
      relations: {
        grade: true,
      },
    });

    if (!student) {
      throw new NotFoundException('Student not found');
    }

    return student;
  }

  async create(createStudentDto: CreateStudentDto): Promise<Student> {
    const {
      admissionNo,
      firstName,
      lastName,
      dateOfBirth,
      gender,
      phone,
      email,
      address,
      gradeId,
    } = createStudentDto;

    // 1. Check admission number
    const existingStudent = await this.studentRepository.findOne({
      where: {
        admissionNo,
      },
    });

    if (existingStudent) {
      throw new ConflictException('Admission number already exists');
    }

    // 2. Check grade
    const grade = await this.gradeRepository.findOne({
      where: {
        id: gradeId,
      },
    });

    if (!grade) {
      throw new NotFoundException('Grade not found');
    }

    // 3. Create student
    const student = this.studentRepository.create({
      admissionNo,
      firstName,
      lastName,
      dateOfBirth: dateOfBirth || null,
      gender: gender || null,
      phone: phone || null,
      email: email || null,
      address: address || null,
      grade,
    });

    // 4. Save to PostgreSQL
    return this.studentRepository.save(student);
  }

  async update(id: string, updateStudentDto: UpdateStudentDto): Promise<Student> {
    const student = await this.studentRepository.findOne({
      where: { id },
      relations: {
        grade: true,
      },
    });

    if (!student) {
      throw new NotFoundException('Student not found');
    }

    if (updateStudentDto.gradeId) {
      const grade = await this.gradeRepository.findOne({
        where: { id: updateStudentDto.gradeId },
      });

      if (!grade) {
        throw new NotFoundException('Grade not found');
      }

      student.grade = grade;
    }

    Object.assign(student, {
      admissionNo: updateStudentDto.admissionNo ?? student.admissionNo,
      firstName: updateStudentDto.firstName ?? student.firstName,
      lastName: updateStudentDto.lastName ?? student.lastName,
      dateOfBirth: updateStudentDto.dateOfBirth ?? student.dateOfBirth,
      gender: updateStudentDto.gender ?? student.gender,
      phone: updateStudentDto.phone ?? student.phone,
      email: updateStudentDto.email ?? student.email,
      address: updateStudentDto.address ?? student.address,
    });

    return this.studentRepository.save(student);
  }

  async remove(id: string): Promise<void> {
    const student = await this.studentRepository.findOne({
      where: { id },
    });

    if (!student) {
      throw new NotFoundException('Student not found');
    }

    await this.studentRepository.remove(student);
  }
}
