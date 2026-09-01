jest.mock('@nestjs/passport', () => ({
  AuthGuard: () => class MockAuthGuard {},
}));

jest.mock('@nestjs/jwt', () => ({
  JwtService: class MockJwtService {
    sign() {
      return 'mock-token';
    }
  },
}));

import { Test, TestingModule } from '@nestjs/testing';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: { login: jest.Mock; validateUser: jest.Mock };

  beforeEach(async () => {
    authService = {
      login: jest.fn(),
      validateUser: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: authService }],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should login a valid user', async () => {
    authService.validateUser.mockResolvedValue({
      id: 'user-1',
      email: 'admin@example.com',
      role: 'admin',
    });
    authService.login.mockResolvedValue({ access_token: 'abc', user: { id: 'user-1', email: 'admin@example.com', role: 'admin' } });

    await expect(controller.login({ email: 'admin@example.com', password: 'admin123' })).resolves.toMatchObject({
      access_token: 'abc',
    });
  });
});
