jest.mock('@nestjs/passport', () => ({
  AuthGuard: () => class MockAuthGuard {},
}));

import { Test, TestingModule } from '@nestjs/testing';

import { UsersController } from './users.controller';
import { UsersService } from './users.service';

describe('UsersController', () => {
  let controller: UsersController;
  let service: { findAll: jest.Mock; findOne: jest.Mock; remove: jest.Mock };

  beforeEach(async () => {
    service = {
      findAll: jest.fn(),
      findOne: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [{ provide: UsersService, useValue: service }],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('should return all users', async () => {
    const users = [{ id: 'user-1', email: 'admin@example.com' }];
    service.findAll.mockResolvedValue(users);

    await expect(controller.findAll()).resolves.toEqual(users);
  });

  it('should return one user by id', async () => {
    const user = { id: 'user-1', email: 'teacher@example.com' };
    service.findOne.mockResolvedValue(user);

    await expect(controller.findOne('user-1')).resolves.toEqual(user);
  });
});
