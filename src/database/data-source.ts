import 'reflect-metadata';

import { DataSource } from 'typeorm';

export default new DataSource({
  type: 'postgres',

  host: process.env.DB_HOST || 'localhost',

  port: Number(process.env.DB_PORT) || 5432,

  username: process.env.DB_USERNAME || 'postgres',

  password: process.env.DB_PASSWORD || 'admin123',

  database: process.env.DB_DATABASE || 'school_management',

  entities: ['src/modules/**/*.entity{.ts,.js}'],

  migrations: ['src/database/migrations/*{.ts,.js}'],

  synchronize: false,
});
