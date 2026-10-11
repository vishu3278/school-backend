import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Grade } from '../grades/grade.entity';
import { AcademicYearsModule } from '../academic-years/academic-years.module';
import { Student } from '../students/student.entity';
import { AdmissionApplication } from './admission-application.entity';
import { AdmissionsController } from './admissions.controller';
import { AdmissionsService } from './admissions.service';
import { FeesModule } from '../fees/fees.module';

@Module({
  imports: [AcademicYearsModule, FeesModule, TypeOrmModule.forFeature([AdmissionApplication, Grade, Student])],
  controllers: [AdmissionsController],
  providers: [AdmissionsService],
})
export class AdmissionsModule {}
