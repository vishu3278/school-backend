import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Section } from '../sections/section.entity';
import { UserRole } from '../users/user-role.enum';
import { User } from '../users/user.entity';

import { CreateSectionTeacherDto } from './dto/create-section-teacher.dto';
import { UpdateSectionTeacherDto } from './dto/update-section-teacher.dto';
import { SectionTeacher } from './section-teacher.entity';

@Injectable()
export class SectionTeachersService {
  constructor(
    @InjectRepository(SectionTeacher)
    private readonly sectionTeacherRepository: Repository<SectionTeacher>,

    @InjectRepository(Section)
    private readonly sectionRepository: Repository<Section>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async findAll(): Promise<SectionTeacher[]> {
    return this.sectionTeacherRepository.find({
      relations: {
        section: {
          grade: true,
        },
        teacher: true,
      },
      order: {
        academicYear: 'DESC',
      },
    });
  }

  async findOne(id: string): Promise<SectionTeacher> {
    const assignment = await this.sectionTeacherRepository.findOne({
      where: { id },
      relations: {
        section: {
          grade: true,
        },
        teacher: true,
      },
    });

    if (!assignment) {
      throw new NotFoundException('Section teacher assignment not found');
    }

    return assignment;
  }

  async create(createSectionTeacherDto: CreateSectionTeacherDto): Promise<SectionTeacher> {
    const { sectionId, teacherId, academicYear, isClassTeacher } = createSectionTeacherDto;

    const section = await this.sectionRepository.findOne({
      where: { id: sectionId },
    });

    if (!section) {
      throw new NotFoundException('Section not found');
    }

    const teacher = await this.userRepository.findOne({
      where: { id: teacherId },
    });

    if (!teacher) {
      throw new NotFoundException('Teacher not found');
    }

    if (teacher.role !== UserRole.TEACHER) {
      throw new ConflictException('User is not a teacher');
    }

    const existingAssignment = await this.sectionTeacherRepository.findOne({
      where: {
        section: { id: sectionId },
        teacher: { id: teacherId },
        academicYear,
      },
    });

    if (existingAssignment) {
      throw new ConflictException('Teacher is already assigned to this section for the academic year');
    }

    const assignment = this.sectionTeacherRepository.create({
      section,
      teacher,
      academicYear,
      isClassTeacher: Boolean(isClassTeacher),
    });

    return this.sectionTeacherRepository.save(assignment);
  }

  async update(id: string, updateSectionTeacherDto: UpdateSectionTeacherDto): Promise<SectionTeacher> {
    const assignment = await this.sectionTeacherRepository.findOne({
      where: { id },
      relations: {
        section: true,
        teacher: true,
      },
    });

    if (!assignment) {
      throw new NotFoundException('Section teacher assignment not found');
    }

    if (updateSectionTeacherDto.sectionId) {
      const section = await this.sectionRepository.findOne({
        where: { id: updateSectionTeacherDto.sectionId },
      });

      if (!section) {
        throw new NotFoundException('Section not found');
      }

      assignment.section = section;
    }

    if (updateSectionTeacherDto.teacherId) {
      const teacher = await this.userRepository.findOne({
        where: { id: updateSectionTeacherDto.teacherId },
      });

      if (!teacher) {
        throw new NotFoundException('Teacher not found');
      }

      if (teacher.role !== UserRole.TEACHER) {
        throw new ConflictException('User is not a teacher');
      }

      assignment.teacher = teacher;
    }

    if (updateSectionTeacherDto.academicYear) {
      assignment.academicYear = updateSectionTeacherDto.academicYear;
    }

    if (updateSectionTeacherDto.isClassTeacher !== undefined) {
      assignment.isClassTeacher = updateSectionTeacherDto.isClassTeacher;
    }

    return this.sectionTeacherRepository.save(assignment);
  }

  async remove(id: string): Promise<void> {
    const assignment = await this.sectionTeacherRepository.findOne({
      where: { id },
    });

    if (!assignment) {
      throw new NotFoundException('Section teacher assignment not found');
    }

    await this.sectionTeacherRepository.remove(assignment);
  }
}
