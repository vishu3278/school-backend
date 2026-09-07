import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AuthModule } from './modules/auth/auth.module';
import { AdmissionsModule } from './modules/admissions/admissions.module';
import { DatabaseModule } from './database/database.module';
import { GradesModule } from './modules/grades/grades.module';
import { SectionTeachersModule } from './modules/section-teachers/section-teachers.module';
import { SectionsModule } from './modules/sections/sections.module';
import { StudentsModule } from './modules/students/students.module';
import { UsersModule } from './modules/users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    DatabaseModule,
    AdmissionsModule,
    StudentsModule,
    GradesModule,
    SectionsModule,
    SectionTeachersModule,
    UsersModule,
    AuthModule,
  ],
})
export class AppModule {}
