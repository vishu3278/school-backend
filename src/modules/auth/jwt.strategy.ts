import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { UsersService } from '../users/users.service';
import { StudentsService } from '../students/students.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly usersService: UsersService,
    private readonly studentsService: StudentsService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'school-management-secret',
    });
  }

  async validate(payload: { sub: string; email: string; role: string; accountType?: string }) {
    if (payload.accountType === 'student') {
      const student = await this.studentsService.findOne(payload.sub);

      if (!student.isActive) {
        throw new UnauthorizedException('Student account is inactive');
      }

      const { password, isActive, ...profile } = student;

      return {
        ...profile,
        role: 'student',
      };
    }

    const user = await this.usersService.findOne(payload.sub);

    if (!user.isActive) {
      throw new UnauthorizedException('User account is inactive');
    }

    const { password, isActive, ...profile } = user;

    return {
      ...profile,
    };
  }
}
