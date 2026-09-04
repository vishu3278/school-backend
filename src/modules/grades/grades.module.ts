import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Grade } from './grade.entity';
import { GradesController } from './grades.controller';
import { GradesService } from './grades.service';
import { Section } from '../sections/section.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Grade, Section])],
  controllers: [GradesController],
  providers: [GradesService],
  exports: [GradesService],
})
export class GradesModule {}
