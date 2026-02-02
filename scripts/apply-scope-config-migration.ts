#!/usr/bin/env ts-node
/**
 * Apply scope_config migration manually
 */

import { Client } from 'pg';

async function main() {
  console.log('📦 Applying scope_config migration...\\n');

  const client = new Client({
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT || '5432'),
    user: process.env.DATABASE_USER || 'passport_user',
    password: process.env.DATABASE_PASSWORD || 'passport_password',
    database: process.env.DATABASE_NAME || 'device_passport',
  });

  try {
    await client.connect();
    console.log('✅ Database connected\\n');

    // Add scope_config column
    console.log('Adding scope_config column...');
    await client.query(`
      ALTER TABLE users
      ADD COLUMN IF NOT EXISTS scope_config JSONB DEFAULT NULL
    `);
    console.log('✅ Column added');

    // Add GIN index
    console.log('Adding GIN index...');
    await client.query(`
      CREATE INDEX IF NOT EXISTS "IDX_users_scope_config_gin"
      ON "users" USING GIN (scope_config)
    `);
    console.log('✅ Index created');

    console.log('\\n✅ Migration applied successfully!');
    await client.end();
    process.exit(0);
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    await client.end();
    process.exit(1);
  }
}

main();
