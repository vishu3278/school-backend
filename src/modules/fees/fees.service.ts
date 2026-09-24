import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { AcademicYear } from '../academic-years/academic-year.entity';
import { Grade } from '../grades/grade.entity';

import { CreateFeeCategoryDto } from './dto/create-fee-category.dto';
import { UpdateFeeCategoryDto } from './dto/update-fee-category.dto';
import { CreateFeeStructureDto } from './dto/create-fee-structure.dto';
import { UpdateFeeStructureDto } from './dto/update-fee-structure.dto';
import { FeeCategory } from './fee-category.entity';
import { FeeStructure } from './fee-structure.entity';

@Injectable()
export class FeesService {
  constructor(
    @InjectRepository(FeeCategory)
    private readonly feeCategoryRepository: Repository<FeeCategory>,
    @InjectRepository(FeeStructure)
    private readonly feeStructureRepository: Repository<FeeStructure>,
    @InjectRepository(Grade)
    private readonly gradeRepository: Repository<Grade>,
    @InjectRepository(AcademicYear)
    private readonly academicYearRepository: Repository<AcademicYear>,
  ) {}

  // ─── Fee Categories ──────────────────────────────────────────────

  async findCategories(): Promise<FeeCategory[]> {
    return this.feeCategoryRepository.find({
      order: { name: 'ASC' },
    });
  }

  async findCategory(id: number): Promise<FeeCategory> {
    const category = await this.feeCategoryRepository.findOne({
      where: { id },
    });

    if (!category) {
      throw new NotFoundException('Fee category not found');
    }

    return category;
  }

  async createCategory(dto: CreateFeeCategoryDto): Promise<FeeCategory> {
    const name = dto.name.trim();

    if (await this.findCategoryByName(name)) {
      throw new ConflictException('Fee category already exists');
    }

    const category = this.feeCategoryRepository.create({
      name,
      description: dto.description?.trim() || null,
    });

    return this.feeCategoryRepository.save(category);
  }

  async updateCategory(
    id: number,
    dto: UpdateFeeCategoryDto,
  ): Promise<FeeCategory> {
    const category = await this.findCategory(id);

    if (dto.name !== undefined) {
      const name = dto.name.trim();
      const existing = await this.findCategoryByName(name);

      if (existing && existing.id !== id) {
        throw new ConflictException('Fee category already exists');
      }

      category.name = name;
    }

    if (dto.description !== undefined) {
      category.description = dto.description?.trim() || null;
    }

    return this.feeCategoryRepository.save(category);
  }

  async removeCategory(id: number): Promise<void> {
    const category = await this.findCategory(id);
    await this.feeCategoryRepository.remove(category);
  }

  private async findCategoryByName(name: string): Promise<FeeCategory | null> {
    return this.feeCategoryRepository.findOne({
      where: { name },
    });
  }

  // ─── Fee Structures ──────────────────────────────────────────────

  async findStructures(): Promise<any[]> {
    return this.feeStructureRepository.query(`
      SELECT fs.*, g.name AS grade_name, ay.name AS academic_year_name,
             fc.name AS fee_category_name
      FROM "fee_structures" fs
      JOIN "grades" g ON fs."grade_id" = g.id
      JOIN "academic_years" ay ON fs."academic_year_id" = ay.id
      JOIN "fee_categories" fc ON fs."fee_category_id" = fc.id
      ORDER BY g.name, ay.name, fc.name
    `).then((rows) =>
      rows.map((row) => ({
        ...row,
        amount: Number(row.amount),
      })),
    );
  }

  async findStructure(id: number): Promise<FeeStructure> {
    const structure = await this.feeStructureRepository.findOne({
      where: { id },
      relations: { grade: true, academicYear: true, feeCategory: true },
    });

    if (!structure) {
      throw new NotFoundException('Fee structure not found');
    }

    return structure;
  }

  async createStructure(dto: CreateFeeStructureDto): Promise<FeeStructure> {
    await this.validateStructureReferences({
      gradeId: dto.gradeId,
      academicYearId: dto.academicYearId,
      feeCategoryId: dto.feeCategoryId,
    });

    const frequency = (dto.frequency ?? 'annual').trim();

    await this.ensureStructureIsAvailable({
      gradeId: dto.gradeId,
      academicYearId: dto.academicYearId,
      feeCategoryId: dto.feeCategoryId,
      frequency,
    });

    const structure = this.feeStructureRepository.create({
      grade: { id: dto.gradeId },
      academicYear: { id: dto.academicYearId },
      feeCategory: { id: dto.feeCategoryId },
      amount: dto.amount,
      frequency,
      dueDate: dto.dueDate || null,
    });

    const saved = await this.feeStructureRepository.save(structure);
    return this.findStructure(saved.id);
  }

  async updateStructure(
    id: number,
    dto: UpdateFeeStructureDto,
  ): Promise<FeeStructure> {
    const structure = await this.findStructure(id);

    const gradeId = dto.gradeId ?? structure.grade.id;
    const academicYearId =
      dto.academicYearId ?? structure.academicYear.id;
    const feeCategoryId =
      dto.feeCategoryId ?? structure.feeCategory.id;
    const frequency = (dto.frequency ?? structure.frequency).trim();

    await this.validateStructureReferences({
      gradeId,
      academicYearId,
      feeCategoryId,
    });

    await this.ensureStructureIsAvailable(
      {
        gradeId,
        academicYearId,
        feeCategoryId,
        frequency,
      },
      id,
    );

    if (dto.gradeId !== undefined) {
      structure.grade = { id: dto.gradeId } as Grade;
    }

    if (dto.academicYearId !== undefined) {
      structure.academicYear = { id: dto.academicYearId } as AcademicYear;
    }

    if (dto.feeCategoryId !== undefined) {
      structure.feeCategory = { id: dto.feeCategoryId } as FeeCategory;
    }

    if (dto.amount !== undefined) {
      structure.amount = dto.amount;
    }

    if (dto.frequency !== undefined) {
      structure.frequency = frequency;
    }

    if (dto.dueDate !== undefined) {
      structure.dueDate = dto.dueDate || null;
    }

    const saved = await this.feeStructureRepository.save(structure);
    return this.findStructure(saved.id);
  }

  async removeStructure(id: number): Promise<void> {
    const structure = await this.feeStructureRepository.findOne({
      where: { id },
    });

    if (!structure) {
      throw new NotFoundException('Fee structure not found');
    }

    await this.feeStructureRepository.remove(structure);
  }

  private async validateStructureReferences(references: {
    gradeId: string;
    academicYearId: number;
    feeCategoryId: number;
  }): Promise<void> {
    const grade = await this.gradeRepository.findOne({
      where: { id: references.gradeId },
    });

    if (!grade) {
      throw new NotFoundException('Grade not found');
    }

    const academicYear = await this.academicYearRepository.findOne({
      where: { id: references.academicYearId },
    });

    if (!academicYear) {
      throw new NotFoundException('Academic year not found');
    }

    const category = await this.feeCategoryRepository.findOne({
      where: { id: references.feeCategoryId },
    });

    if (!category) {
      throw new NotFoundException('Fee category not found');
    }
  }

  private async ensureStructureIsAvailable(
    uniqueKeys: {
      gradeId: string;
      academicYearId: number;
      feeCategoryId: number;
      frequency: string;
    },
    excludeId?: number,
  ): Promise<void> {
    const existing = await this.feeStructureRepository.findOne({
      where: {
        grade: { id: uniqueKeys.gradeId },
        academicYear: { id: uniqueKeys.academicYearId },
        feeCategory: { id: uniqueKeys.feeCategoryId },
        frequency: uniqueKeys.frequency,
      },
    });

    if (existing && existing.id !== excludeId) {
      throw new ConflictException(
        'A fee structure already exists for this grade, academic year, category and frequency',
      );
    }
  }
}