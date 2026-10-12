import { Type } from 'class-transformer';
import { IsDateString, IsInt, IsOptional, Min } from 'class-validator';

export class CreateCustomFeeInvoiceDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  feeStructureId: number;

  @IsOptional()
  @IsDateString()
  dueDate?: string;
}
