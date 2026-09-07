import { PartialType } from '@nestjs/mapped-types';

import { CreateAdmissionApplicationDto } from './create-admission-application.dto';

export class UpdateAdmissionApplicationDto extends PartialType(
  CreateAdmissionApplicationDto,
) {}
