import {
  IsEmail,
  IsEnum,
  Matches,
  IsOptional,
  IsString,
} from 'class-validator';

import { UserRole } from '../user-role.enum';
import {
  PHONE_PATTERN,
  UserGender,
  UserMaritalStatus,
  YEAR_OF_PASSING_PATTERN,
} from '../user-validation';

export class CreateUserDto {
  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsEmail()
  email: string;

  @IsString()
  password: string;

  @IsEnum(UserRole)
  role: UserRole;

  @IsOptional()
  @IsString()
  @Matches(PHONE_PATTERN, { message: 'Phone must be blank or exactly 10 digits' })
  phone?: string;

  @IsOptional()
  @IsString()
  highestEducation?: string;

  @IsOptional()
  @IsString()
  institution?: string;

  @IsOptional()
  @IsString()
  @Matches(YEAR_OF_PASSING_PATTERN, { message: 'Year of passing must be blank or a 4-digit year starting with 19 or 20' })
  yearOfPassing?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsEnum(UserMaritalStatus)
  maritalStatus?: UserMaritalStatus;

  @IsOptional()
  @IsEnum(UserGender)
  gender?: UserGender;

  @IsOptional()
  @IsString()
  photo?: string;
}
