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

import { CreateFeeCategoryDto } from './dto/create-fee-category.dto';
import { UpdateFeeCategoryDto } from './dto/update-fee-category.dto';
import { FeesService } from './fees.service';

@Controller('fee-categories')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class FeeCategoriesController {
  constructor(private readonly feesService: FeesService) {}

  @Roles(UserRole.ADMIN)
  @Get()
  findAll() {
    return this.feesService.findCategories();
  }

  @Roles(UserRole.ADMIN)
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.feesService.findCategory(id);
  }

  @Roles(UserRole.ADMIN)
  @Post()
  create(@Body() dto: CreateFeeCategoryDto) {
    return this.feesService.createCategory(dto);
  }

  @Roles(UserRole.ADMIN)
  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateFeeCategoryDto,
  ) {
    return this.feesService.updateCategory(id, dto);
  }

  @Roles(UserRole.ADMIN)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.feesService.removeCategory(id);
  }
}