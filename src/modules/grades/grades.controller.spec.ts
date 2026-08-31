import { Test, TestingModule } from '@nestjs/testing';

import { GradesController } from './grades.controller';
import { GradesService } from './grades.service';

describe('GradesController', () => {
  let controller: GradesController;
  let service: { findAll: jest.Mock; findOne: jest.Mock; create: jest.Mock; update: jest.Mock; remove: jest.Mock };

  beforeEach(async () => {
    service = {
      findAll: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [GradesController],
      providers: [{ provide: GradesService, useValue: service }],
    }).compile();

    controller = module.get<GradesController>(GradesController);
  });

  it('should return all grades', async () => {
    const grades = [{ id: 'grade-1', name: 'Grade 1' }];
    service.findAll.mockResolvedValue(grades);

    await expect(controller.findAll()).resolves.toEqual(grades);
  });

  it('should create a grade', async () => {
    const grade = { id: 'grade-1', name: 'Grade 1' };
    service.create.mockResolvedValue(grade);

    await expect(controller.create({ name: 'Grade 1' })).resolves.toEqual(grade);
  });
});
