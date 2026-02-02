import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User, Organization } from '../entities';
import { UserRole, OrganizationType, ProductLine, DataScope } from '@device-passport/shared';

/**
 * RBAC Test Data Seeder
 *
 * Creates comprehensive test data for multi-tenant RBAC system validation:
 * - 3 Organizations (Platform, Supplier, Customer)
 * - 10+ Users with different roles and permission scopes
 * - Demonstrates organization isolation and fine-grained permissions
 *
 * Based on RBAC-SOLUTION.md scenarios
 */
export async function seedRBACTestData(dataSource: DataSource): Promise<void> {
  const userRepository = dataSource.getRepository(User);
  const organizationRepository = dataSource.getRepository(Organization);

  console.log('🌱 Seeding RBAC test data...');

  // ============================================
  // 1. Create Organizations
  // ============================================

  // Platform Organization (Luna Medical)
  const platformOrg = organizationRepository.create({
    id: '00000000-0000-0000-0000-000000000001',
    name: 'Luna Medical Platform',
    code: 'LMP',
    type: OrganizationType.INTERNAL,
    city: 'Shanghai',
    country: 'China',
    email: 'contact@luna.medical',
    website: 'https://luna.medical',
    isActive: true,
  });

  // Supplier Organization (Siemens China)
  const supplierOrg = organizationRepository.create({
    id: '00000000-0000-0000-0000-000000000002',
    name: 'Siemens China',
    code: 'SIE',
    type: OrganizationType.SUPPLIER,
    city: 'Beijing',
    country: 'China',
    email: 'contact@siemens.com.cn',
    website: 'https://siemens.com.cn',
    isActive: true,
  });

  // Customer Organization (Sinopec)
  const customerOrg = organizationRepository.create({
    id: '00000000-0000-0000-0000-000000000003',
    name: 'China Petroleum & Chemical Corporation',
    code: 'SPC',
    type: OrganizationType.CUSTOMER,
    city: 'Beijing',
    country: 'China',
    email: 'procurement@sinopec.com',
    website: 'https://sinopec.com',
    isActive: true,
  });

  await organizationRepository.save([platformOrg, supplierOrg, customerOrg]);

  console.log('✅ Created 3 organizations: Platform, Supplier, Customer');

  // ============================================
  // 2. Create Platform Users (Luna Medical)
  // ============================================

  const hashedPassword = await bcrypt.hash('Password123!', 10);

  // Platform Admin - Full access
  const platformAdmin = userRepository.create({
    email: 'admin@luna.medical',
    password: hashedPassword,
    name: 'Platform Admin',
    role: UserRole.ADMIN,
    organizationId: platformOrg.id,
    scopeConfig: {
      dataScope: DataScope.ALL,
    },
    isActive: true,
  });

  // Platform QC - Can override supplier QC, see all data
  const platformQC = userRepository.create({
    email: 'qc@luna.medical',
    password: hashedPassword,
    name: 'Platform QC Inspector',
    role: UserRole.QC_INSPECTOR,
    organizationId: platformOrg.id,
    scopeConfig: {
      dataScope: DataScope.ALL,
      canApprove: true,
    },
    isActive: true,
  });

  // Platform Operator - Manage devices and orders
  const platformOperator = userRepository.create({
    email: 'operator@luna.medical',
    password: hashedPassword,
    name: 'Platform Operator',
    role: UserRole.OPERATOR,
    organizationId: platformOrg.id,
    scopeConfig: {
      dataScope: DataScope.ALL,
    },
    isActive: true,
  });

  await userRepository.save([platformAdmin, platformQC, platformOperator]);

  console.log('✅ Created 3 platform users (Admin, QC, Operator)');

  // ============================================
  // 3. Create Supplier Users (Siemens China)
  // ============================================

  // Supplier Admin - Manage all supplier org data
  const supplierAdmin = userRepository.create({
    email: 'admin@siemens.com.cn',
    password: hashedPassword,
    name: 'Zhang Wei (Siemens Admin)',
    role: UserRole.SUPPLIER_ADMIN,
    organizationId: supplierOrg.id,
    scopeConfig: {
      dataScope: DataScope.ALL,
    },
    isActive: true,
  });

  // Supplier QC - Only PF (Packaging Filling) Product Line
  const supplierQC_PLC = userRepository.create({
    email: 'qc.wang@siemens.com.cn',
    password: hashedPassword,
    name: 'Wang QC (PF Only)',
    role: UserRole.SUPPLIER_QC,
    organizationId: supplierOrg.id,
    scopeConfig: {
      dataScope: DataScope.ALL,
      productLines: [ProductLine.PF], // ⭐ Only sees PF (Packaging Filling) products
      canApprove: true,
    },
    isActive: true,
  });

  // Supplier QC - All Product Lines
  const supplierQC_All = userRepository.create({
    email: 'qc.li@siemens.com.cn',
    password: hashedPassword,
    name: 'Li QC (All Products)',
    role: UserRole.SUPPLIER_QC,
    organizationId: supplierOrg.id,
    scopeConfig: {
      dataScope: DataScope.ALL,
      // No productLines restriction - sees all
      canApprove: true,
    },
    isActive: true,
  });

  // Supplier Packer
  const supplierPacker = userRepository.create({
    email: 'packer.liu@siemens.com.cn',
    password: hashedPassword,
    name: 'Liu Packer',
    role: UserRole.SUPPLIER_PACKER,
    organizationId: supplierOrg.id,
    scopeConfig: {
      dataScope: DataScope.ALL,
    },
    isActive: true,
  });

  // Supplier Shipper
  const supplierShipper = userRepository.create({
    email: 'shipper.zhao@siemens.com.cn',
    password: hashedPassword,
    name: 'Zhao Shipper',
    role: UserRole.SUPPLIER_SHIPPER,
    organizationId: supplierOrg.id,
    scopeConfig: {
      dataScope: DataScope.ALL,
    },
    isActive: true,
  });

  // Supplier Viewer - Read-only
  const supplierViewer = userRepository.create({
    email: 'viewer@siemens.com.cn',
    password: hashedPassword,
    name: 'Sales Viewer',
    role: UserRole.SUPPLIER_VIEWER,
    organizationId: supplierOrg.id,
    scopeConfig: {
      dataScope: DataScope.ALL,
    },
    isActive: true,
  });

  await userRepository.save([
    supplierAdmin,
    supplierQC_PLC,
    supplierQC_All,
    supplierPacker,
    supplierShipper,
    supplierViewer,
  ]);

  console.log('✅ Created 6 supplier users (Admin, 2xQC, Packer, Shipper, Viewer)');

  // ============================================
  // 4. Create Customer Users (Sinopec)
  // ============================================

  // Customer Admin
  const customerAdmin = userRepository.create({
    email: 'admin@sinopec.com',
    password: hashedPassword,
    name: 'Chen Manager',
    role: UserRole.CUSTOMER,
    organizationId: customerOrg.id,
    scopeConfig: {
      dataScope: DataScope.ALL,
    },
    isActive: true,
  });

  // Customer Engineer - Only own service requests
  const customerEngineer = userRepository.create({
    email: 'engineer.huang@sinopec.com',
    password: hashedPassword,
    name: 'Huang Engineer',
    role: UserRole.CUSTOMER,
    organizationId: customerOrg.id,
    scopeConfig: {
      dataScope: DataScope.OWN, // ⭐ Only sees own created requests
    },
    isActive: true,
  });

  await userRepository.save([customerAdmin, customerEngineer]);

  console.log('✅ Created 2 customer users (Admin, Engineer)');

  // ============================================
  // Summary
  // ============================================

  console.log('\n📊 RBAC Test Data Summary:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Organizations:');
  console.log(`  • Luna Medical Platform (${platformOrg.code}) - INTERNAL`);
  console.log(`  • Siemens China (${supplierOrg.code}) - SUPPLIER`);
  console.log(`  • Sinopec (${customerOrg.code}) - CUSTOMER`);
  console.log('\nPlatform Users (Luna Medical):');
  console.log('  • admin@luna.medical - ADMIN (All permissions)');
  console.log('  • qc@luna.medical - QC_INSPECTOR (Can override supplier QC)');
  console.log('  • operator@luna.medical - OPERATOR (Manage devices)');
  console.log('\nSupplier Users (Siemens):');
  console.log('  • admin@siemens.com.cn - SUPPLIER_ADMIN');
  console.log('  • qc.wang@siemens.com.cn - SUPPLIER_QC (⭐ PLC ONLY)');
  console.log('  • qc.li@siemens.com.cn - SUPPLIER_QC (All products)');
  console.log('  • packer.liu@siemens.com.cn - SUPPLIER_PACKER');
  console.log('  • shipper.zhao@siemens.com.cn - SUPPLIER_SHIPPER');
  console.log('  • viewer@siemens.com.cn - SUPPLIER_VIEWER (Read-only)');
  console.log('\nCustomer Users (Sinopec):');
  console.log('  • admin@sinopec.com - CUSTOMER (Org-level access)');
  console.log('  • engineer.huang@sinopec.com - CUSTOMER (⭐ Own data only)');
  console.log('\nDefault Password: Password123!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}
