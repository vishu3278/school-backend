import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';

import { Repository } from 'typeorm';

import { Grade } from '../grades/grade.entity';
import { Section } from '../sections/section.entity';

import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';

import { Student } from './student.entity';

async function generateAdmissionNumber(repository: Repository<Student>): Promise<string> {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const year = String(now.getFullYear()).slice(-2);
  const prefix = `${month}${year}`;

  const getNumberFromAdmission = (value: string): number => {
    const suffix = value.replace(prefix, '');
    const parsed = Number.parseInt(suffix, 10);
    return Number.isNaN(parsed) ? 0 : parsed;
  };

  const rows = await repository
    .createQueryBuilder('student')
    .where('student.admission_no LIKE :prefix', { prefix: `${prefix}%` })
    .select('student.admission_no', 'admissionNo')
    .getRawMany();

  const maxNumber = rows.reduce((max, row) => {
    const nextValue = getNumberFromAdmission(row.admissionNo);
    return Math.max(max, nextValue);
  }, 0);

  return `${prefix}${String(maxNumber + 1).padStart(3, '0')}`;
}

@Injectable()
export class StudentsService {
  constructor(
    @InjectRepository(Student)
    private readonly studentRepository: Repository<Student>,

    @InjectRepository(Grade)
    private readonly gradeRepository: Repository<Grade>,

    @InjectRepository(Section)
    private readonly sectionRepository: Repository<Section>,
  ) {}

  async findAll(): Promise<Student[]> {
    return this.studentRepository.find({
      relations: {
        grade: true,
        section: true,
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
        section: true,
      },
    });

    if (!student) {
      throw new NotFoundException('Student not found');
    }

    return student;
  }

  async findByEmail(email: string): Promise<Student | null> {
    return this.studentRepository.findOne({
      where: { email: email.trim().toLowerCase() },
    });
  }

  async updatePasswordHash(id: string, passwordHash: string): Promise<void> {
    await this.studentRepository.update(id, { password: passwordHash });
  }

  async create(createStudentDto: CreateStudentDto): Promise<Student> {
    const {
      admissionNo,
      firstName,
      lastName,
      dateOfBirth,
      gender,
      phone,
      phone2,
      email,
      address,
      password,
      motherName,
      fatherName,
      aadharNo,
      religion,
      gradeId,
      sectionId,
    } = createStudentDto;

    const nextAdmissionNo =
      admissionNo && admissionNo.trim()
        ? admissionNo.trim()
        : await generateAdmissionNumber(this.studentRepository);

    const existingStudent = await this.studentRepository.findOne({
      where: {
        admissionNo: nextAdmissionNo,
      },
    });

    if (existingStudent) {
      throw new ConflictException('Admission number already exists');
    }

    const grade = await this.gradeRepository.findOne({
      where: {
        id: gradeId,
      },
    });

    if (!grade) {
      throw new NotFoundException('Grade not found');
    }

    const section = await this.sectionRepository.findOne({
      where: {
        id: sectionId,
      },
      relations: {
        grade: true,
      },
    });

    if (!section) {
      throw new NotFoundException('Section not found');
    }

    if (section.grade.id !== gradeId) {
      throw new ConflictException('Section does not belong to the selected grade');
    }

    const student = this.studentRepository.create({
      admissionNo: nextAdmissionNo,
      firstName,
      lastName,
      dateOfBirth: dateOfBirth || null,
      gender: gender || null,
      phone: phone || null,
      phone2: phone2 || null,
      email: email ? email.trim().toLowerCase() : null,
      address: address || null,
      password: await bcrypt.hash(
        password && password.trim() ? password.trim() : nextAdmissionNo,
        10,
      ),
      isActive: createStudentDto.isActive ?? true,
      motherName: motherName || null,
      fatherName: fatherName || null,
      aadharNo: aadharNo || null,
      religion: religion || null,
      grade,
      section,
    });

    return this.studentRepository.save(student);
  }

  async update(id: string, updateStudentDto: UpdateStudentDto): Promise<Student> {
    const student = await this.studentRepository.findOne({
      where: { id },
      relations: {
        grade: true,
        section: true,
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

    if (updateStudentDto.sectionId) {
      const section = await this.sectionRepository.findOne({
        where: { id: updateStudentDto.sectionId },
        relations: { grade: true },
      });

      if (!section) {
        throw new NotFoundException('Section not found');
      }

      const selectedGradeId = updateStudentDto.gradeId ?? student.grade?.id;
      if (selectedGradeId && section.grade.id !== selectedGradeId) {
        throw new ConflictException('Section does not belong to the selected grade');
      }

      student.section = section;
    }

    Object.assign(student, {
      admissionNo: student.admissionNo,
      firstName: updateStudentDto.firstName ?? student.firstName,
      lastName: updateStudentDto.lastName ?? student.lastName,
      dateOfBirth: updateStudentDto.dateOfBirth ?? student.dateOfBirth,
      gender: updateStudentDto.gender ?? student.gender,
      phone: updateStudentDto.phone ?? student.phone,
      phone2: updateStudentDto.phone2 ?? student.phone2,
      email: updateStudentDto.email
        ? updateStudentDto.email.trim().toLowerCase()
        : student.email,
      address: updateStudentDto.address ?? student.address,
      password:
        updateStudentDto.password && updateStudentDto.password.trim()
          ? await bcrypt.hash(updateStudentDto.password.trim(), 10)
          : student.password,
      isActive: updateStudentDto.isActive ?? student.isActive,
      motherName: updateStudentDto.motherName ?? student.motherName,
      fatherName: updateStudentDto.fatherName ?? student.fatherName,
      aadharNo: updateStudentDto.aadharNo ?? student.aadharNo,
      religion: updateStudentDto.religion ?? student.religion,
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
