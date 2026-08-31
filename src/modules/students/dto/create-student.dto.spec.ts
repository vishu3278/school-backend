import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

import { CreateStudentDto } from './create-student.dto';

describe('CreateStudentDto', () => {
  it('allows empty optional email values and valid UUID grade IDs', async () => {
    const dto = plainToInstance(CreateStudentDto, {
      admissionNo: 'A-001',
      firstName: 'Ada',
      lastName: 'Lovelace',
      gender: 'FEMALE',
      phone: '1234567890',
      email: '',
      address: '',
      gradeId: '11111111-1111-4111-8111-111111111111',
    });

    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
  });
});
