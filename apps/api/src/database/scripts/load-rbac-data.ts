#!/usr/bin/env ts-node
/**
 * Load RBAC Test Data
 */

import { DataSource } from 'typeorm';
import { seedRBACTestData } from '../seeds/rbac-test-data.seed';
import * as dotenv from 'dotenv';
import { join } from 'path';

// Load environment variables from root
dotenv.config({ path: join(__dirname, '../../../../../.env') });

async function main() {
  console.log('📦 Loading RBAC test data...\n');

  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT || '5432'),
    username: process.env.DATABASE_USER || 'passport_user',
    password: process.env.DATABASE_PASSWORD || 'passport_password',
    database: process.env.DATABASE_NAME || 'device_passport',
    entities: [join(__dirname, '../entities/**/*.entity{.ts,.js}')],
    synchronize: false,
  });

  try {
    await dataSource.initialize();
    console.log('✅ Database connected\n');

    // Apply migration first
    console.log('Applying scope_config migration...');
    await dataSource.query(`
      ALTER TABLE users
      ADD COLUMN IF NOT EXISTS scope_config JSONB DEFAULT NULL
    `);
    console.log('✅ Column added');

    await dataSource.query(`
      CREATE INDEX IF NOT EXISTS "IDX_users_scope_config_gin"
      ON "users" USING GIN (scope_config)
    `);
    console.log('✅ Index created\n');

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
