import { IsString, MaxLength } from 'class-validator';
export class VoidFeePaymentDto {
  @IsString() @MaxLength(255) reason: string;
}
