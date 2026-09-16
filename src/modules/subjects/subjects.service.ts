import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { AcademicYear } from '../academic-years/academic-year.entity';
import { Grade } from '../grades/grade.entity';
import { Section } from '../sections/section.entity';
import { Subject } from './subject.entity';
import { AssignGradeSubjectDto } from './dto/assign-grade-subject.dto';
import { AssignSectionSubjectDto } from './dto/assign-section-subject.dto';
import { CreateSubjectDto } from './dto/create-subject.dto';
import { UpdateSubjectDto } from './dto/update-subject.dto';

@Injectable()
export class SubjectsService {
  constructor(
    @InjectRepository(Subject)
    private readonly subjectRepository: Repository<Subject>,

    @InjectRepository(Grade)
    private readonly gradeRepository: Repository<Grade>,

    @InjectRepository(Section)
    private readonly sectionRepository: Repository<Section>,

    @InjectRepository(AcademicYear)
    private readonly academicYearRepository: Repository<AcademicYear>,
  ) {}

  async findAll(): Promise<Subject[]> {
    return this.subjectRepository.find({ order: { name: 'ASC' } });
  }

  async findOne(id: number): Promise<Subject> {
    const subject = await this.subjectRepository.findOne({ where: { id } });

    if (!subject) {
      throw new NotFoundException('Subject not found');
    }

    return subject;
  }

  async create(dto: CreateSubjectDto): Promise<Subject> {
    const name = dto.name.trim();

    const existing = await this.subjectRepository.findOne({ where: { name } });
    if (existing) {
      throw new NotFoundException('Subject already exists');
    }

    const subject = this.subjectRepository.create({
      name,
      code: dto.code?.trim() ?? null,
      isElective: dto.isElective ?? false,
    });

    return this.subjectRepository.save(subject);
  }

  async update(id: number, dto: UpdateSubjectDto): Promise<Subject> {
    const subject = await this.findOne(id);

    if (dto.name !== undefined) {
      const name = dto.name.trim();
      const existing = await this.subjectRepository.findOne({ where: { name } });
      if (existing && existing.id !== id) {
        throw new NotFoundException('Subject already exists');
      }
      subject.name = name;
    }

    if (dto.code !== undefined) {
      subject.code = dto.code?.trim() ?? null;
    }

    if (dto.isElective !== undefined) {
      subject.isElective = dto.isElective;
    }

    return this.subjectRepository.save(subject);
  }

  async assignToGrade(dto: AssignGradeSubjectDto): Promise<any> {
    const grade = await this.gradeRepository.findOne({ where: { id: dto.gradeId } });
    if (!grade) {
      throw new NotFoundException('Grade not found');
    }

    const subject = await this.subjectRepository.findOne({ where: { id: dto.subjectId } });
    if (!subject) {
      throw new NotFoundException('Subject not found');
    }

    const academicYear = await this.academicYearRepository.findOne({ where: { id: dto.academicYearId } });
    if (!academicYear) {
      throw new NotFoundException('Academic year not found');
    }

    const existing = await this.subjectRepository.query(
      `SELECT * FROM grade_subjects WHERE "grade_id" = $1 AND "subject_id" = $2 AND "academic_year_id" = $3`,
      [dto.gradeId, dto.subjectId, dto.academicYearId],
    );

    if (existing.length > 0) {
      throw new NotFoundException('Subject already assigned to this grade for the given academic year');
    }

    const result = await this.subjectRepository.query(
      `INSERT INTO "grade_subjects" ("grade_id", "subject_id", "academic_year_id", "is_elective")
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [dto.gradeId, dto.subjectId, dto.academicYearId, dto.isElective ?? false],
    );

    return result[0];
  }

  async assignToSection(dto: AssignSectionSubjectDto): Promise<any> {
    const section = await this.sectionRepository.findOne({ where: { id: dto.sectionId } });
    if (!section) {
      throw new NotFoundException('Section not found');
    }

    const subject = await this.subjectRepository.findOne({ where: { id: dto.subjectId } });
    if (!subject) {
      throw new NotFoundException('Subject not found');
    }

    if (dto.teacherId) {
      const userExists = await this.subjectRepository.query(
        `SELECT id FROM users WHERE id = $1`,
        [dto.teacherId],
      );
      if (userExists.length === 0) {
        throw new NotFoundException('Teacher not found');
      }
    }

    const existing = await this.subjectRepository.query(
      `SELECT * FROM section_subjects WHERE "section_id" = $1 AND "subject_id" = $2`,
      [dto.sectionId, dto.subjectId],
    );

    if (existing.length > 0) {
      throw new NotFoundException('Subject already assigned to this section');
    }

    const result = await this.subjectRepository.query(
      `INSERT INTO "section_subjects" ("section_id", "subject_id", "teacher_id")
       VALUES ($1, $2, $3)
       RETURNING *`,
      [dto.sectionId, dto.subjectId, dto.teacherId ?? null],
    );

    return result[0];
  }

  async remove(id: number): Promise<void> {
    const subject = await this.subjectRepository.findOne({ where: { id } });
    if (!subject) {
      throw new NotFoundException('Subject not found');
    }
    await this.subjectRepository.remove(subject);
  }

  async findGradeSubjects(): Promise<any[]> {
    return this.subjectRepository.query(`
      SELECT gs.*, g.name as grade_name, ay.name as academic_year_name, s.name as subject_name, s.code as subject_code
      FROM "grade_subjects" gs
      JOIN "grades" g ON gs."grade_id" = g.id
      JOIN "academic_years" ay ON gs."academic_year_id" = ay.id
      JOIN "subjects" s ON gs."subject_id" = s.id
      ORDER BY ay.name, g.name, s.name
    `);
  }

  async findSectionSubjects(): Promise<any[]> {
    return this.subjectRepository.query(`
      SELECT ss.*, sec.name as section_name, g.name as grade_name, s.name as subject_name, s.code as subject_code,
             u.email as teacher_email
      FROM "section_subjects" ss
      JOIN "sections" sec ON ss."section_id" = sec.id
      JOIN "grades" g ON sec."grade_id" = g.id
      JOIN "subjects" s ON ss."subject_id" = s.id
      LEFT JOIN "users" u ON ss."teacher_id" = u.id
      ORDER BY sec.name, s.name
    `);
  }
}
