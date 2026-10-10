import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';
import { FeeCategoryCode } from '../fee-category.entity';

export class CreateFeeCategoryDto {
  @IsString()
  @MaxLength(100)
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsIn(Object.values(FeeCategoryCode))
  code?: FeeCategoryCode | null;
}
