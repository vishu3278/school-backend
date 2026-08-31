import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { Grade } from './grade.entity';
import { CreateGradeDto } from './dto/create-grade.dto';
import { UpdateGradeDto } from './dto/update-grade.dto';

@Injectable()
export class GradesService {
  constructor(
    @InjectRepository(Grade)
    private readonly gradeRepository: Repository<Grade>,
  ) {}

  async findAll(): Promise<Grade[]> {
    return this.gradeRepository.find({
      order: {
        name: 'ASC',
      },
    });
  }

  async findOne(id: string): Promise<Grade> {
    const grade = await this.gradeRepository.findOne({
      where: { id },
    });

    if (!grade) {
      throw new NotFoundException('Grade not found');
    }

    return grade;
  }

  async create(createGradeDto: CreateGradeDto): Promise<Grade> {
    const normalizedName = createGradeDto.name.trim();

    const existingGrade = await this.gradeRepository.findOne({
      where: { name: normalizedName },
    });

    if (existingGrade) {
      throw new ConflictException('Grade already exists');
    }

    const grade = this.gradeRepository.create({
      name: normalizedName,
    });

    return this.gradeRepository.save(grade);
  }

  async update(id: string, updateGradeDto: UpdateGradeDto): Promise<Grade> {
    const grade = await this.gradeRepository.findOne({
      where: { id },
    });

    if (!grade) {
      throw new NotFoundException('Grade not found');
    }

    const newName = updateGradeDto.name?.trim();

    if (newName) {
      const existingGrade = await this.gradeRepository.findOne({
        where: { name: newName },
      });

      if (existingGrade && existingGrade.id !== id) {
        throw new ConflictException('Grade already exists');
      }

      grade.name = newName;
    }

    return this.gradeRepository.save(grade);
  }

  async remove(id: string): Promise<void> {
    const grade = await this.gradeRepository.findOne({
      where: { id },
    });

    if (!grade) {
      throw new NotFoundException('Grade not found');
    }

    await this.gradeRepository.remove(grade);
  }
}
