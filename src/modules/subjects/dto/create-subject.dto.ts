import { IsInt, IsNotEmpty, IsOptional, IsString, IsUUID, validateSync } from 'class-validator';

export class CreateSubjectDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  code?: string;

  @IsOptional()
  isElective?: boolean;
}
