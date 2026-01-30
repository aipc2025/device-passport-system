import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';
import {
  UserRole,
  OrganizationType,
  ProductLine,
  OriginCode,
  DeviceStatus,
  generatePassportCode,
} from '@device-passport/shared';

dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT || '5432', 10),
  username: process.env.DATABASE_USER || 'passport_user',
  password: process.env.DATABASE_PASSWORD || 'passport_password',
  database: process.env.DATABASE_NAME || 'device_passport',
  entities: [__dirname + '/../entities/*.entity{.ts,.js}'],
  synchronize: true,
  logging: false,
});

async function seed() {
  console.log('Connecting to database...');
  await AppDataSource.initialize();

  const organizationRepo = AppDataSource.getRepository('Organization');
  const userRepo = AppDataSource.getRepository('User');
  const passportRepo = AppDataSource.getRepository('DevicePassport');
  const sequenceRepo = AppDataSource.getRepository('SequenceCounter');

  console.log('Seeding organizations...');
  // Create organizations
  const internalOrg = await organizationRepo.save({
    name: 'MedTech Industrial',
    code: 'MED',
    type: OrganizationType.INTERNAL,
    address: '100 Industrial Park',
    city: 'Shanghai',
    country: 'China',
    phone: '+86-21-12345678',
    email: 'info@luna.top',
    website: 'https://medtech.com',
  });

  const supplier1 = await organizationRepo.save({
    name: 'Siemens AG',
    code: 'SIE',
    type: OrganizationType.SUPPLIER,
    address: 'Werner-von-Siemens-Str. 1',
    city: 'Munich',
    country: 'Germany',
    email: 'contact@luna.top',
    website: 'https://siemens.com',
  });

  const customer1 = await organizationRepo.save({
    name: 'ABC Manufacturing',
    code: 'ABC',
    type: OrganizationType.CUSTOMER,
    address: '500 Factory Road',
    city: 'Suzhou',
    country: 'China',
    phone: '+86-512-87654321',
    email: 'contact@luna.top',
  });

  console.log('Seeding users...');
  // Create users
  const hashedPassword = await bcrypt.hash('password123', 10);

  const adminUser = await userRepo.save({
    email: 'admin@luna.top',
    password: hashedPassword,
    name: 'System Admin',
    role: UserRole.ADMIN,
    organizationId: internalOrg.id,
  });

  const operatorUser = await userRepo.save({
    email: 'operator@luna.top',
    password: hashedPassword,
    name: 'John Operator',
    role: UserRole.OPERATOR,
    organizationId: internalOrg.id,
  });

  const engineerUser = await userRepo.save({
    email: 'engineer@luna.top',
    password: hashedPassword,
    name: 'Mike Engineer',
    role: UserRole.ENGINEER,
    organizationId: internalOrg.id,
  });

  const qcUser = await userRepo.save({
    email: 'qc@luna.top',
    password: hashedPassword,
    name: 'Lisa QC',
    role: UserRole.QC_INSPECTOR,
    organizationId: internalOrg.id,
  });

  const customerUser = await userRepo.save({
    email: 'customer@luna.top',
    password: hashedPassword,
    name: 'Tom Customer',
    role: UserRole.CUSTOMER,
    organizationId: customer1.id,
  });

  console.log('Seeding sequence counters...');
  // Create sequence counter
  await sequenceRepo.save({
    companyCode: 'MED',
    year: new Date().getFullYear(),
    productLine: ProductLine.PLC,
    originCode: OriginCode.DE,
    currentSequence: 2,
  });

  console.log('Seeding device passports...');
  // Generate passport codes using the official algorithm
  const passportCode1 = generatePassportCode('MED', 2025, ProductLine.PLC, OriginCode.DE, 1);
  const passportCode2 = generatePassportCode('MED', 2025, ProductLine.PLC, OriginCode.DE, 2);

  console.log('  Generated codes:', passportCode1, passportCode2);

  // Create sample passports
  await passportRepo.save({
    passportCode: passportCode1,
    productLine: ProductLine.PLC,
    originCode: OriginCode.DE,
    status: DeviceStatus.IN_SERVICE,
    deviceName: 'Siemens S7-1500 PLC',
    deviceModel: 'S7-1500',
    manufacturer: 'Siemens',
    manufacturerPartNumber: '6ES7511-1AK02-0AB0',
    serialNumber: 'SN-2025-001',
    specifications: {
      voltage: '24V DC',
      memory: '150KB',
      interfaces: ['PROFINET', 'PROFIBUS'],
    },
    manufactureDate: new Date('2025-01-10'),
    warrantyExpiryDate: new Date('2027-01-10'),
    supplierId: supplier1.id,
    customerId: customer1.id,
    currentLocation: 'ABC Manufacturing - Production Line A',
    createdBy: operatorUser.id,
    updatedBy: operatorUser.id,
  });

  await passportRepo.save({
    passportCode: passportCode2,
    productLine: ProductLine.PLC,
    originCode: OriginCode.DE,
    status: DeviceStatus.IN_QC,
    deviceName: 'Siemens S7-1200 PLC',
    deviceModel: 'S7-1200',
    manufacturer: 'Siemens',
    manufacturerPartNumber: '6ES7214-1AG40-0XB0',
    serialNumber: 'SN-2025-002',
    specifications: {
      voltage: '24V DC',
      memory: '75KB',
      interfaces: ['PROFINET'],
    },
    manufactureDate: new Date('2025-01-15'),
    warrantyExpiryDate: new Date('2027-01-15'),
    supplierId: supplier1.id,
    currentLocation: 'QC Department',
    createdBy: operatorUser.id,
    updatedBy: qcUser.id,
  });

  console.log('Seed completed successfully!');
  console.log('');
  console.log('Test accounts:');
  console.log('  Admin: admin@luna.top / password123');
  console.log('  Operator: operator@luna.top / password123');
  console.log('  Engineer: engineer@luna.top / password123');
  console.log('  QC Inspector: qc@luna.top / password123');
  console.log('  Customer: customer@luna.top / password123');

  await AppDataSource.destroy();
}

seed().catch((error) => {
  console.error('Seed failed:', error);
  process.exit(1);
});
