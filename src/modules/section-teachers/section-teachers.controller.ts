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

import { CreateSectionTeacherDto } from './dto/create-section-teacher.dto';
import { UpdateSectionTeacherDto } from './dto/update-section-teacher.dto';
import { SectionTeachersService } from './section-teachers.service';

@Controller('section-teachers')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class SectionTeachersController {
  constructor(private readonly sectionTeachersService: SectionTeachersService) {}

  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @Get()
  findAll() {
    return this.sectionTeachersService.findAll();
  }

  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.sectionTeachersService.findOne(id);
  }

  @Roles(UserRole.ADMIN)
  @Post()
  create(@Body() createSectionTeacherDto: CreateSectionTeacherDto) {
    return this.sectionTeachersService.create(createSectionTeacherDto);
  }

  @Roles(UserRole.ADMIN)
  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() updateSectionTeacherDto: UpdateSectionTeacherDto,
  ) {
    return this.sectionTeachersService.update(id, updateSectionTeacherDto);
  }

  @Roles(UserRole.ADMIN)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.sectionTeachersService.remove(id);
  }
}
