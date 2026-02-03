import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddScopeConfigToUsers1738664000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add scope_config JSONB column to users table for RBAC permissions
    await queryRunner.addColumn(
      'users',
      new TableColumn({
        name: 'scope_config',
        type: 'jsonb',
        isNullable: true,
        default: null,
        comment: 'Permission scope configuration (dataScope, productLines, departments, etc.)',
      })
    );

    // Create GIN index on scope_config for faster JSONB queries
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_users_scope_config_gin"
      ON "users" USING GIN (scope_config)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop index first
    await queryRunner.query(`
      DROP INDEX IF EXISTS "IDX_users_scope_config_gin"
    `);

    // Drop column
    await queryRunner.dropColumn('users', 'scope_config');
  }
}
