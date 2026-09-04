import { IsBoolean, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateSectionTeacherDto {
  @IsUUID()
  sectionId: string;

  @IsUUID()
  teacherId: string;

  @IsString()
  academicYear: string;

  @IsOptional()
  @IsBoolean()
  isClassTeacher?: boolean;
}
