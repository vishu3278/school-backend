jest.mock('@nestjs/jwt', () => ({
  JwtService: class MockJwtService {
    sign() {
      return 'mock-token';
    }
  },
}));

import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';

import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { StudentsService } from '../students/students.service';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: { findByEmail: jest.Mock };
  let studentsService: { findByEmail: jest.Mock; updatePasswordHash: jest.Mock };

  beforeEach(async () => {
    usersService = {
      findByEmail: jest.fn(),
    };
    studentsService = {
      findByEmail: jest.fn(),
      updatePasswordHash: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: usersService,
        },
        {
          provide: JwtService,
          useValue: { sign: jest.fn().mockReturnValue('mock-token') },
        },
        {
          provide: StudentsService,
          useValue: studentsService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should return null when password does not match', async () => {
    usersService.findByEmail.mockResolvedValue({
      id: 'user-1',
      email: 'admin@example.com',
      password: 'hashed-password',
      role: 'admin',
      isActive: true,
    });

    const result = await service.validateUser('admin@example.com', 'wrong-password');

    expect(result).toBeNull();
  });

  it('should return user when password matches', async () => {
    usersService.findByEmail.mockResolvedValue({
      id: 'user-1',
      email: 'admin@example.com',
      password: 'hashed-password',
      role: 'admin',
      isActive: true,
    });

    jest.spyOn(service as any, 'comparePasswords').mockResolvedValue(true);

    const result = await service.validateUser('admin@example.com', 'password');

    expect(result).toMatchObject({ email: 'admin@example.com', role: 'admin' });
  });

  it('should not authenticate an inactive user', async () => {
    usersService.findByEmail.mockResolvedValue({
      id: 'user-1',
      email: 'admin@example.com',
      password: 'hashed-password',
      role: 'admin',
      isActive: false,
    });

    const result = await service.validateUser('admin@example.com', 'password');

    expect(result).toBeNull();
  });
});
