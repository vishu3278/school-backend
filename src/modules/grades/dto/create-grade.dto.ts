import { IsString, MinLength } from 'class-validator';

export class CreateGradeDto {
  @IsString()
  @MinLength(2)
  name: string;
}
