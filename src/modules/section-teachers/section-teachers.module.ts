import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Section } from '../sections/section.entity';
import { User } from '../users/user.entity';

import { SectionTeacher } from './section-teacher.entity';
import { SectionTeachersController } from './section-teachers.controller';
import { SectionTeachersService } from './section-teachers.service';

@Module({
  imports: [TypeOrmModule.forFeature([SectionTeacher, Section, User])],
  controllers: [SectionTeachersController],
  providers: [SectionTeachersService],
  exports: [SectionTeachersService],
})
export class SectionTeachersModule {}
