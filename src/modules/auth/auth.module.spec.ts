jest.mock('@nestjs/passport', () => ({
  AuthGuard: () => class MockAuthGuard {},
  PassportStrategy: (strategy) => strategy,
}));

jest.mock('@nestjs/jwt', () => ({
  JwtModule: {
    register: () => ({ module: class MockJwtModule {} }),
  },
  JwtService: class MockJwtService {
    sign() {
      return 'mock-token';
    }
  },
}));

import { Test, TestingModule } from '@nestjs/testing';

import { AuthController } from './auth.controller';
import { AuthModule } from './auth.module';

describe('AuthModule', () => {
  it('should register the auth controller', async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AuthModule],
      controllers: [AuthController],
    }).compile();

    expect(module.get(AuthController)).toBeDefined();
  });
});
