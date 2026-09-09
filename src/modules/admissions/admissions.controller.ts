import { Body, Controller, Get, Param, Post, Put, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { UserRole } from '../users/user-role.enum';
import { CreateAdmissionApplicationDto } from './dto/create-admission-application.dto';
import { UpdateAdmissionApplicationDto } from './dto/update-admission-application.dto';
import { AdmissionsService } from './admissions.service';

@Controller('admissions')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class AdmissionsController {
  constructor(private readonly admissionsService: AdmissionsService) {}

  @Get()
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  findAll() { return this.admissionsService.findAll(); }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  findOne(@Param('id') id: string) { return this.admissionsService.findOne(id); }

  @Post()
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  create(@Body() dto: CreateAdmissionApplicationDto) {
    return this.admissionsService.create(dto);
  }

  @Put(':id')
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  update(
    @Param('id') id: string,
    @Body() dto: UpdateAdmissionApplicationDto,
    @Req() req: { user: { role: UserRole } },
  ) {
    return this.admissionsService.update(id, dto, req.user.role);
  }
}
