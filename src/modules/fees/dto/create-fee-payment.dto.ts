import { Type } from 'class-transformer';
import {
  IsDateString,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
} from 'class-validator';
export class CreateFeePaymentDto {
  @IsUUID() invoiceId: string;
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  amount: number;
  @IsOptional() @IsDateString() paymentDate?: string;
  @IsIn(['cash', 'card', 'upi', 'bank_transfer', 'cheque']) paymentMode: string;
  @IsOptional() @IsString() @MaxLength(100) transactionRef?: string;
  @IsOptional() @IsString() @MaxLength(255) remarks?: string;
}
