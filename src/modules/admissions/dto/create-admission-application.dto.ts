import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsDateString,
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

import { Gender } from '../../students/dto/create-student.dto';
import { AdmissionStatus } from '../admission-application.entity';

const optionalString = ({ value }: { value: unknown }) =>
  typeof value === 'string' && value.trim() === '' ? undefined : value;

const optionalBoolean = ({ value }: { value: unknown }) =>
  value === undefined || value === '' ? undefined : value === true || value === 'true';

export class CreateAdmissionApplicationDto {
  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsDateString()
  dateOfBirth: string;

  @Transform(optionalString)
  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @Transform(optionalString)
  @IsOptional()
  @IsString()
  fatherName?: string;

  @Transform(optionalString)
  @IsOptional()
  @IsString()
  motherName?: string;

  @Transform(optionalString)
  @IsOptional()
  @IsString()
  studentAadharNo?: string;

  @IsString()
  fatherAadharNo: string;

  @IsString()
  motherAadharNo: string;

  @Transform(optionalString)
  @IsOptional()
  @IsString()
  fatherOccupation?: string;

  @Transform(optionalString)
  @IsOptional()
  @IsString()
  motherOccupation?: string;

  @Transform(optionalString)
  @IsOptional()
  @IsString()
  phone1?: string;

  @Transform(optionalString)
  @IsOptional()
  @IsString()
  phone2?: string;

  @Transform(optionalString)
  @IsOptional()
  @IsEmail()
  email?: string;

  @Transform(optionalString)
  @IsOptional()
  @IsString()
  previousSchool?: string;

  @Transform(optionalString)
  @IsOptional()
  @IsString()
  previousGrade?: string;

  @Transform(optionalString)
  @IsOptional()
  @IsString()
  previousResult?: string;

  @IsString()
  academicYear: string;

  @IsUUID()
  requestedGradeId: string;

  @Transform(optionalBoolean)
  @IsOptional()
  @IsBoolean()
  birthCertificateReceived?: boolean;

  @Transform(optionalBoolean)
  @IsOptional()
  @IsBoolean()
  transferCertificateReceived?: boolean;

  @Transform(optionalBoolean)
  @IsOptional()
  @IsBoolean()
  previousMarksheetReceived?: boolean;

  @Transform(optionalBoolean)
  @IsOptional()
  @IsBoolean()
  photosReceived?: boolean;

  @IsOptional()
  @IsEnum(AdmissionStatus)
  status?: AdmissionStatus;
}
