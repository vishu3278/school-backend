import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';

import { UsersService } from '../users/users.service';
import { User } from '../users/user.entity';
import { StudentsService } from '../students/students.service';

type AuthenticatedUser = {
  id: string;
  email: string;
  role: string;
  accountType: 'user' | 'student';
};

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly studentsService: StudentsService,
  ) {}

  async validateUser(email: string, password: string): Promise<AuthenticatedUser | null> {
    const user = await this.usersService.findByEmail(email.trim().toLowerCase());

    if (user && user.isActive && await this.comparePasswords(password, user.password)) {
      return {
        id: user.id,
        email: user.email,
        role: user.role,
        accountType: 'user',
      };
    }

    const student = await this.studentsService.findByEmail(email);

    if (!student || !student.isActive || !student.password) {
      return null;
    }

    const isHashed = student.password.startsWith('$2a$') || student.password.startsWith('$2b$') || student.password.startsWith('$2y$');
    const isPasswordValid = isHashed
      ? await this.comparePasswords(password, student.password)
      : password === student.password;

    if (!isPasswordValid) {
      return null;
    }

    if (!isHashed) {
      await this.studentsService.updatePasswordHash(
        student.id,
        await bcrypt.hash(password, 10),
      );
    }

    return {
      id: student.id,
      email: student.email as string,
      role: 'student',
      accountType: 'student',
    };
  }

  async login(user: AuthenticatedUser | Partial<User>) {
    if (!user.id || !user.email || !user.role) {
      throw new UnauthorizedException('Invalid user payload');
    }

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      accountType: 'accountType' in user ? user.accountType : 'user',
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    };
  }

  async comparePasswords(plainTextPassword: string, hashedPassword: string) {
    return bcrypt.compare(plainTextPassword, hashedPassword);
  }
}
