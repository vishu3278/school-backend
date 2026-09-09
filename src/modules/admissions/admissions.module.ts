import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Grade } from '../grades/grade.entity';
import { Student } from '../students/student.entity';
import { AdmissionApplication } from './admission-application.entity';
import { AdmissionsController } from './admissions.controller';
import { AdmissionsService } from './admissions.service';

@Module({
  imports: [TypeOrmModule.forFeature([AdmissionApplication, Grade, Student])],
  controllers: [AdmissionsController],
  providers: [AdmissionsService],
})
export class AdmissionsModule {}
