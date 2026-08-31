import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Grade } from '../grades/grade.entity';
import { Student } from './student.entity';
import { StudentsController } from './students.controller';
import { StudentsService } from './students.service';

@Module({
  imports: [TypeOrmModule.forFeature([Student, Grade])],

  controllers: [StudentsController],

  providers: [StudentsService],

  exports: [StudentsService],
})
export class StudentsModule {}
