import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT || '5432', 10),
  username: process.env.DATABASE_USER || 'passport_user',
  password: process.env.DATABASE_PASSWORD || 'passport_password',
  database: process.env.DATABASE_NAME || 'device_passport',
  synchronize: false,
  logging: true,
});

async function reset() {
  console.log('Connecting to database...');
  await AppDataSource.initialize();

  console.log('Dropping all tables...');
  await AppDataSource.dropDatabase();

  console.log('Database reset completed.');
  console.log('Run "pnpm db:seed" to recreate tables and seed data.');

  await AppDataSource.destroy();
}

reset().catch((error) => {
  console.error('Reset failed:', error);
  process.exit(1);
});
