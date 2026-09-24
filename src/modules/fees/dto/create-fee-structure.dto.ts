import { Type } from 'class-transformer';
import {
  IsDateString,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsUUID,
  Min,
} from 'class-validator';

export const FEE_FREQUENCIES = ['annual', 'quarterly', 'monthly', 'one_time'];

export class CreateFeeStructureDto {
  @IsUUID()
  gradeId: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  academicYearId: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  feeCategoryId: number;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  amount: number;

  @IsOptional()
  @IsIn(FEE_FREQUENCIES)
  frequency?: string;

  @IsOptional()
  @IsDateString()
  dueDate?: string;
}