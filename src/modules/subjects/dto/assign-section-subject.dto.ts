import { IsInt, IsOptional, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';

export class AssignSectionSubjectDto {
  @IsUUID()
  sectionId: string;

  @IsInt()
  @Type(() => Number)
  subjectId: number;

  @IsUUID()
  @IsOptional()
  teacherId?: string;
}
