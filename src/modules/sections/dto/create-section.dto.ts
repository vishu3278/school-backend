import { IsString, IsUUID, MinLength } from 'class-validator';

export class CreateSectionDto {
  @IsString()
  @MinLength(1)
  name: string;

  @IsUUID()
  gradeId: string;
}
