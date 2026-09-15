import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

import { AcademicYear } from './academic-year.entity';
import { CreateAcademicYearDto } from './dto/create-academic-year.dto';
import { UpdateAcademicYearDto } from './dto/update-academic-year.dto';

@Injectable()
export class AcademicYearsService {
  constructor(
    @InjectRepository(AcademicYear) private readonly repository: Repository<AcademicYear>,
    private readonly dataSource: DataSource,
  ) {}

  findAll(): Promise<AcademicYear[]> {
    return this.repository.find({ order: { startDate: 'DESC', name: 'DESC' } });
  }

  async findOne(id: number): Promise<AcademicYear> {
    const academicYear = await this.repository.findOneBy({ id });
    if (!academicYear) throw new NotFoundException('Academic year not found');
    return academicYear;
  }

  async ensureExists(name: string): Promise<void> {
    if (!(await this.repository.findOneBy({ name: name.trim() }))) {
      throw new BadRequestException('Academic year does not exist');
    }
  }

  async create(dto: CreateAcademicYearDto): Promise<AcademicYear> {
    const name = dto.name.trim();
    this.validateDates(dto.startDate, dto.endDate);
    await this.ensureNameIsAvailable(name);
    return this.saveWithCurrentRule(this.repository.create({ ...dto, name, isCurrent: dto.isCurrent ?? false }));
  }

  async update(id: number, dto: UpdateAcademicYearDto): Promise<AcademicYear> {
    const academicYear = await this.findOne(id);
    const name = dto.name?.trim();
    if (name && name !== academicYear.name) await this.ensureNameIsAvailable(name, id);
    this.validateDates(dto.startDate ?? academicYear.startDate, dto.endDate ?? academicYear.endDate);
    Object.assign(academicYear, dto);
    if (name) academicYear.name = name;
    return this.saveWithCurrentRule(academicYear);
  }

  private async saveWithCurrentRule(academicYear: AcademicYear): Promise<AcademicYear> {
    return this.dataSource.transaction(async (manager) => {
      if (academicYear.isCurrent) await manager.update(AcademicYear, { isCurrent: true }, { isCurrent: false });
      return manager.save(AcademicYear, academicYear);
    });
  }

  private validateDates(startDate: string, endDate: string): void {
    if (startDate >= endDate) throw new BadRequestException('End date must be after start date');
  }

  private async ensureNameIsAvailable(name: string, excludeId?: number): Promise<void> {
    const existing = await this.repository.findOneBy({ name });
    if (existing && existing.id !== excludeId) throw new ConflictException('Academic year already exists');
  }
}
