import { Body, Controller, Get, Param, ParseIntPipe, Post, Put, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { UserRole } from '../users/user-role.enum';
import { AcademicYearsService } from './academic-years.service';
import { CreateAcademicYearDto } from './dto/create-academic-year.dto';
import { UpdateAcademicYearDto } from './dto/update-academic-year.dto';

@Controller('academic-years')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class AcademicYearsController {
  constructor(private readonly service: AcademicYearsService) {}

  @Get() @Roles(UserRole.ADMIN, UserRole.TEACHER)
  findAll() { return this.service.findAll(); }

  @Get(':id') @Roles(UserRole.ADMIN, UserRole.TEACHER)
  findOne(@Param('id', ParseIntPipe) id: number) { return this.service.findOne(id); }

  @Post() @Roles(UserRole.ADMIN)
  create(@Body() dto: CreateAcademicYearDto) { return this.service.create(dto); }

  @Put(':id') @Roles(UserRole.ADMIN)
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateAcademicYearDto) { return this.service.update(id, dto); }
}
