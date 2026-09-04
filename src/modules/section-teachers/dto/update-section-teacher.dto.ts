import { PartialType } from '@nestjs/mapped-types';

import { CreateSectionTeacherDto } from './create-section-teacher.dto';

export class UpdateSectionTeacherDto extends PartialType(CreateSectionTeacherDto) {}
