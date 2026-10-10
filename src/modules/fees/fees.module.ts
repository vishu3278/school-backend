import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AcademicYear } from '../academic-years/academic-year.entity';
import { Grade } from '../grades/grade.entity';

import { FeeCategoriesController } from './fee-categories.controller';
import { FeeCategory } from './fee-category.entity';
import { FeeStructure } from './fee-structure.entity';
import { FeePayment } from './fee-payment.entity';
import { StudentFeeInvoice } from './student-fee-invoice.entity';
import { FeeLedgerController } from './fee-ledger.controller';
import { FeeLedgerService } from './fee-ledger.service';
import { FeeStructuresController } from './fee-structures.controller';
import { FeesService } from './fees.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      FeeCategory,
      FeeStructure,
      Grade,
      AcademicYear,
      StudentFeeInvoice,
      FeePayment,
    ]),
  ],
  controllers: [FeeCategoriesController, FeeStructuresController, FeeLedgerController],
  providers: [FeesService, FeeLedgerService],
  exports: [FeesService, FeeLedgerService],
})
export class FeesModule {}
