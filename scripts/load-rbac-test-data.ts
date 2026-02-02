#!/usr/bin/env ts-node
/**
 * Load RBAC Test Data
 */

import { DataSource } from 'typeorm';
import { seedRBACTestData } from '../apps/api/src/database/seeds/rbac-test-data.seed';

async function main() {
  console.log('📦 Loading RBAC test data...\n');

  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'device_passport',
    entities: ['apps/api/src/database/entities/**/*.entity.ts'],
    synchronize: false,
  });

  try {
    await dataSource.initialize();
    console.log('✅ Database connected\n');

    await seedRBACTestData(dataSource);

    console.log('\n✅ RBAC test data loaded successfully!');
    console.log('\nYou can now run: pnpm exec ts-node scripts/verify-rbac-simple.ts\n');

    await dataSource.destroy();
    process.exit(0);
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    if (error.detail) {
      console.error('Detail:', error.detail);
    }
    await dataSource.destroy();
    process.exit(1);
  }
}

main();
