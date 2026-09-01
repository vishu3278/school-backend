import * as bcrypt from 'bcryptjs';

import { DataSource } from 'typeorm';

import { UserRole } from '../modules/users/user-role.enum';
import { User } from '../modules/users/user.entity';

import appDataSource from './data-source';

const defaultUsers = [
  {
    firstName: 'System',
    lastName: 'Admin',
    email: 'admin@example.com',
    password: 'admin123',
    role: UserRole.ADMIN,
  },
  {
    firstName: 'Alice',
    lastName: 'Teacher',
    email: 'teacher@example.com',
    password: 'teacher123',
    role: UserRole.TEACHER,
  },
  {
    firstName: 'Nina',
    lastName: 'Staff',
    email: 'staff@example.com',
    password: 'staff123',
    role: UserRole.STAFF,
  },
];

async function seedUsers() {
  const dataSource = await appDataSource.initialize();
  const userRepository = dataSource.getRepository(User);

  for (const userSeed of defaultUsers) {
    const existingUser = await userRepository.findOne({
      where: { email: userSeed.email },
    });

    if (!existingUser) {
      const hashedPassword = await bcrypt.hash(userSeed.password, 10);

      await userRepository.save(
        userRepository.create({
          firstName: userSeed.firstName,
          lastName: userSeed.lastName,
          email: userSeed.email,
          password: hashedPassword,
          role: userSeed.role,
          isActive: true,
        }),
      );
    }
  }

  console.log('Seeded default users successfully.');
  await dataSource.destroy();
}

seedUsers().catch((error) => {
  console.error('User seeding failed:', error);
  process.exit(1);
});
