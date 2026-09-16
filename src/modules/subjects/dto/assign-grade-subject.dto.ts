import { IsInt, IsOptional, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';

export class AssignGradeSubjectDto {
  @IsUUID()
  gradeId: string;

  @IsInt()
  @Type(() => Number)
  subjectId: number;

  @IsInt()
  @Type(() => Number)
  academicYearId: number;

  @IsOptional()
  isElective?: boolean;
}
