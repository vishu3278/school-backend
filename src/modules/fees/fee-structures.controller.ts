import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { UserRole } from '../users/user-role.enum';

import { CreateFeeStructureDto } from './dto/create-fee-structure.dto';
import { UpdateFeeStructureDto } from './dto/update-fee-structure.dto';
import { FeesService } from './fees.service';

@Controller('fee-structures')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class FeeStructuresController {
  constructor(private readonly feesService: FeesService) {}

  @Roles(UserRole.ADMIN)
  @Get()
  findAll() {
    return this.feesService.findStructures();
  }

  @Roles(UserRole.ADMIN)
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.feesService.findStructure(id);
  }

  @Roles(UserRole.ADMIN)
  @Post()
  create(@Body() dto: CreateFeeStructureDto) {
    return this.feesService.createStructure(dto);
  }

  @Roles(UserRole.ADMIN)
  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateFeeStructureDto,
  ) {
    return this.feesService.updateStructure(id, dto);
  }

  @Roles(UserRole.ADMIN)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.feesService.removeStructure(id);
  }
}