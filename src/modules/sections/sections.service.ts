import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Grade } from '../grades/grade.entity';

import { CreateSectionDto } from './dto/create-section.dto';
import { UpdateSectionDto } from './dto/update-section.dto';
import { Section } from './section.entity';

@Injectable()
export class SectionsService {
  constructor(
    @InjectRepository(Section)
    private readonly sectionRepository: Repository<Section>,

    @InjectRepository(Grade)
    private readonly gradeRepository: Repository<Grade>,
  ) {}

  async findAll(gradeId?: string): Promise<Section[]> {
    const query = this.sectionRepository
      .createQueryBuilder('section')
      .leftJoinAndSelect('section.grade', 'grade')
      .orderBy('section.name', 'ASC');

    if (gradeId) {
      query.where('grade.id = :gradeId', { gradeId });
    }

    return query.getMany();
  }

  async findOne(id: string): Promise<Section> {
    const section = await this.sectionRepository.findOne({
      where: { id },
      relations: {
        grade: true,
        students: true,
        teachers: {
          teacher: true,
        },
      },
    });

    if (!section) {
      throw new NotFoundException('Section not found');
    }

    return section;
  }

  async create(createSectionDto: CreateSectionDto): Promise<Section> {
    const { name, gradeId } = createSectionDto;
    const normalizedName = name.trim();

    const grade = await this.gradeRepository.findOne({
      where: { id: gradeId },
    });

    if (!grade) {
      throw new NotFoundException('Grade not found');
    }

    const existingSection = await this.sectionRepository.findOne({
      where: {
        grade: { id: gradeId },
        name: normalizedName,
      },
    });

    if (existingSection) {
      throw new ConflictException('Section already exists for this grade');
    }

    const section = this.sectionRepository.create({
      name: normalizedName,
      grade,
    });

    return this.sectionRepository.save(section);
  }

  async update(id: string, updateSectionDto: UpdateSectionDto): Promise<Section> {
    const section = await this.sectionRepository.findOne({
      where: { id },
      relations: {
        grade: true,
      },
    });

    if (!section) {
      throw new NotFoundException('Section not found');
    }

    if (updateSectionDto.gradeId) {
      const grade = await this.gradeRepository.findOne({
        where: { id: updateSectionDto.gradeId },
      });

      if (!grade) {
        throw new NotFoundException('Grade not found');
      }

      section.grade = grade;
    }

    if (updateSectionDto.name) {
      const normalizedName = updateSectionDto.name.trim();
      const existingSection = await this.sectionRepository.findOne({
        where: {
          grade: { id: section.grade.id },
          name: normalizedName,
        },
      });

      if (existingSection && existingSection.id !== id) {
        throw new ConflictException('Section already exists for this grade');
      }

      section.name = normalizedName;
    }

    return this.sectionRepository.save(section);
  }

  async remove(id: string): Promise<void> {
    const section = await this.sectionRepository.findOne({
      where: { id },
    });

    if (!section) {
      throw new NotFoundException('Section not found');
    }

    await this.sectionRepository.remove(section);
  }
}
