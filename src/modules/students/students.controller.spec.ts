import { Test, TestingModule } from '@nestjs/testing';

import { StudentsController } from './students.controller';
import { StudentsService } from './students.service';

describe('StudentsController', () => {
  let controller: StudentsController;
  let service: { findAll: jest.Mock; findOne: jest.Mock; remove: jest.Mock };

  beforeEach(async () => {
    service = {
      findAll: jest.fn(),
      findOne: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [StudentsController],
      providers: [{ provide: StudentsService, useValue: service }],
    }).compile();

    controller = module.get<StudentsController>(StudentsController);
  });

  it('should return all students', async () => {
    const students = [{ id: 'student-1' }];
    service.findAll.mockResolvedValue(students);

    await expect(
      controller.findAll({ user: { id: 'admin-1', role: 'admin' } }),
    ).resolves.toEqual(students);
    expect(service.findAll).toHaveBeenCalledWith(undefined);
  });

  it('should return a single student by id', async () => {
    const student = { id: 'student-1' };
    service.findOne.mockResolvedValue(student);

    await expect(
      controller.findOne('student-1', {
        user: { id: 'admin-1', role: 'admin' },
      }),
    ).resolves.toEqual(student);
    expect(service.findOne).toHaveBeenCalledWith('student-1', undefined);
  });

  it('limits a teacher request to that teacher assignments', async () => {
    await controller.findAll({ user: { id: 'teacher-1', role: 'teacher' } });

    expect(service.findAll).toHaveBeenCalledWith('teacher-1');
  });
});
