import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { UserRole } from '../users/user-role.enum';

import { CreateSectionDto } from './dto/create-section.dto';
import { UpdateSectionDto } from './dto/update-section.dto';
import { SectionsService } from './sections.service';

@Controller('sections')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class SectionsController {
  constructor(private readonly sectionsService: SectionsService) {}

  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @Get()
  findAll(@Query('gradeId') gradeId?: string) {
    return this.sectionsService.findAll(gradeId);
  }

  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.sectionsService.findOne(id);
  }

  @Roles(UserRole.ADMIN)
  @Post()
  create(@Body() createSectionDto: CreateSectionDto) {
    return this.sectionsService.create(createSectionDto);
  }

  @Roles(UserRole.ADMIN)
  @Put(':id')
  update(@Param('id') id: string, @Body() updateSectionDto: UpdateSectionDto) {
    return this.sectionsService.update(id, updateSectionDto);
  }

  @Roles(UserRole.ADMIN)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.sectionsService.remove(id);
  }
}
