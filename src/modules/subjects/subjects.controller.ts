import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { UserRole } from '../users/user-role.enum';

import { AssignGradeSubjectDto } from './dto/assign-grade-subject.dto';
import { AssignSectionSubjectDto } from './dto/assign-section-subject.dto';
import { CreateSubjectDto } from './dto/create-subject.dto';
import { UpdateSubjectDto } from './dto/update-subject.dto';
import { SubjectsService } from './subjects.service';

@Controller('subjects')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class SubjectsController {
  constructor(private readonly subjectsService: SubjectsService) {}

  @Roles(UserRole.ADMIN)
  @Get('grade-subjects')
  getGradeSubjects() {
    return this.subjectsService.findGradeSubjects();
  }

  @Roles(UserRole.ADMIN)
  @Get('section-subjects')
  getSectionSubjects() {
    return this.subjectsService.findSectionSubjects();
  }

  @Roles(UserRole.ADMIN)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.subjectsService.findOne(+id);
  }

  @Roles(UserRole.ADMIN)
  @Get()
  findAll() {
    return this.subjectsService.findAll();
  }

  @Roles(UserRole.ADMIN)
  @Post()
  create(@Body() dto: CreateSubjectDto) {
    return this.subjectsService.create(dto);
  }

  @Roles(UserRole.ADMIN)
  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateSubjectDto) {
    return this.subjectsService.update(+id, dto);
  }

  @Roles(UserRole.ADMIN)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.subjectsService.remove(+id);
  }

  @Roles(UserRole.ADMIN)
  @Post('assign/grade')
  assignToGrade(@Body() dto: AssignGradeSubjectDto) {
    return this.subjectsService.assignToGrade(dto);
  }

  @Roles(UserRole.ADMIN)
  @Post('assign/section')
  assignToSection(@Body() dto: AssignSectionSubjectDto) {
    return this.subjectsService.assignToSection(dto);
  }
}
