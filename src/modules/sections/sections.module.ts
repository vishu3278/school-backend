import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Grade } from '../grades/grade.entity';

import { Section } from './section.entity';
import { SectionsController } from './sections.controller';
import { SectionsService } from './sections.service';

@Module({
  imports: [TypeOrmModule.forFeature([Section, Grade])],
  controllers: [SectionsController],
  providers: [SectionsService],
  exports: [SectionsService],
})
export class SectionsModule {}
