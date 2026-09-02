jest.mock('@nestjs/jwt', () => ({
  JwtService: class MockJwtService {
    sign() {
      return 'mock-token';
    }
  },
}));

import { Test, TestingModule } from '@nestjs/testing';

import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: { findByEmail: jest.Mock };

  beforeEach(async () => {
    usersService = {
      findByEmail: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: usersService,
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
    });

    jest.spyOn(service as any, 'comparePasswords').mockResolvedValue(true);

    const result = await service.validateUser('admin@example.com', 'password');

    expect(result).toMatchObject({ email: 'admin@example.com', role: 'admin' });
  });
});
