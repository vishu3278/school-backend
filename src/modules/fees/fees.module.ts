import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AcademicYear } from '../academic-years/academic-year.entity';
import { Grade } from '../grades/grade.entity';

import { FeeCategoriesController } from './fee-categories.controller';
import { FeeCategory } from './fee-category.entity';
import { FeeStructure } from './fee-structure.entity';
import { FeeStructuresController } from './fee-structures.controller';
import { FeesService } from './fees.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      FeeCategory,
      FeeStructure,
      Grade,
      AcademicYear,
    ]),
  ],
  controllers: [FeeCategoriesController, FeeStructuresController],
  providers: [FeesService],
  exports: [FeesService],
})
export class FeesModule {}