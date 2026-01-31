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
  // Create or update organizations (find existing or create)
  let internalOrg = await organizationRepo.findOne({ where: { code: 'MED' } });
  if (!internalOrg) {
    internalOrg = await organizationRepo.save({
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
  }

  let supplier1 = await organizationRepo.findOne({ where: { code: 'SIE' } });
  if (!supplier1) {
    supplier1 = await organizationRepo.save({
      name: 'Siemens AG',
      code: 'SIE',
      type: OrganizationType.SUPPLIER,
      address: 'Werner-von-Siemens-Str. 1',
      city: 'Munich',
      country: 'Germany',
      email: 'contact@luna.top',
      website: 'https://siemens.com',
    });
  }

  let customer1 = await organizationRepo.findOne({ where: { code: 'ABC' } });
  if (!customer1) {
    customer1 = await organizationRepo.save({
      name: 'ABC Manufacturing',
      code: 'ABC',
      type: OrganizationType.CUSTOMER,
      address: '500 Factory Road',
      city: 'Suzhou',
      country: 'China',
      phone: '+86-512-87654321',
      email: 'contact@luna.top',
    });
  }

  console.log('Seeding users...');
  // Create or update users with fresh password
  const hashedPassword = await bcrypt.hash('password123', 10);

  // Admin user
  let adminUser = await userRepo.findOne({ where: { email: 'admin@luna.top' } });
  if (adminUser) {
    adminUser.password = hashedPassword;
    adminUser.isActive = true;
    await userRepo.save(adminUser);
  } else {
    adminUser = await userRepo.save({
      email: 'admin@luna.top',
      password: hashedPassword,
      name: 'System Admin',
      role: UserRole.ADMIN,
      organizationId: internalOrg.id,
      isActive: true,
    });
  }

  // Operator user
  let operatorUser = await userRepo.findOne({ where: { email: 'operator@luna.top' } });
  if (operatorUser) {
    operatorUser.password = hashedPassword;
    operatorUser.isActive = true;
    await userRepo.save(operatorUser);
  } else {
    operatorUser = await userRepo.save({
      email: 'operator@luna.top',
      password: hashedPassword,
      name: 'John Operator',
      role: UserRole.OPERATOR,
      organizationId: internalOrg.id,
      isActive: true,
    });
  }

  // Engineer user
  let engineerUser = await userRepo.findOne({ where: { email: 'engineer@luna.top' } });
  if (engineerUser) {
    engineerUser.password = hashedPassword;
    engineerUser.isActive = true;
    await userRepo.save(engineerUser);
  } else {
    engineerUser = await userRepo.save({
      email: 'engineer@luna.top',
      password: hashedPassword,
      name: 'Mike Engineer',
      role: UserRole.ENGINEER,
      organizationId: internalOrg.id,
      isActive: true,
    });
  }

  // QC user
  let qcUser = await userRepo.findOne({ where: { email: 'qc@luna.top' } });
  if (qcUser) {
    qcUser.password = hashedPassword;
    qcUser.isActive = true;
    await userRepo.save(qcUser);
  } else {
    qcUser = await userRepo.save({
      email: 'qc@luna.top',
      password: hashedPassword,
      name: 'Lisa QC',
      role: UserRole.QC_INSPECTOR,
      organizationId: internalOrg.id,
      isActive: true,
    });
  }

  // Customer user
  let customerUser = await userRepo.findOne({ where: { email: 'customer@luna.top' } });
  if (customerUser) {
    customerUser.password = hashedPassword;
    customerUser.isActive = true;
    await userRepo.save(customerUser);
  } else {
    customerUser = await userRepo.save({
      email: 'customer@luna.top',
      password: hashedPassword,
      name: 'Tom Customer',
      role: UserRole.CUSTOMER,
      organizationId: customer1.id,
      isActive: true,
    });
  }

  console.log('Seeding sequence counters...');
  // Create sequence counter (using YYMM format)
  const now = new Date();
  const yearMonth = `${(now.getFullYear() % 100).toString().padStart(2, '0')}${(now.getMonth() + 1).toString().padStart(2, '0')}`;

  const existingSequence = await sequenceRepo.findOne({
    where: { companyCode: 'MED', yearMonth, productLine: ProductLine.PKG, originCode: OriginCode.CN },
  });
  if (!existingSequence) {
    await sequenceRepo.save({
      companyCode: 'MED',
      yearMonth,
      productLine: ProductLine.PKG,
      originCode: OriginCode.CN,
      currentSequence: 2,
    });
  }

  console.log('Seeding device passports...');
  // Generate passport codes using the official algorithm (year, month, productType)
  const passportCode1 = generatePassportCode('MED', 2026, 1, ProductLine.PKG, OriginCode.CN, 1);
  const passportCode2 = generatePassportCode('MED', 2026, 1, ProductLine.IP, OriginCode.DE, 2);

  console.log('  Generated codes:', passportCode1, passportCode2);

  // Create sample passports (skip if exists)
  const existingPassport1 = await passportRepo.findOne({ where: { passportCode: passportCode1 } });
  if (!existingPassport1) {
    await passportRepo.save({
      passportCode: passportCode1,
      productLine: ProductLine.PKG,
      originCode: OriginCode.CN,
      status: DeviceStatus.IN_SERVICE,
      deviceName: 'Automated Packaging Line PKG-2000',
      deviceModel: 'PKG-2000',
      manufacturer: 'LUNA INDUSTRY',
      manufacturerPartNumber: 'LI-PKG-2000-001',
      serialNumber: 'SN-2025-001',
      specifications: {
        voltage: '380V AC',
        capacity: '2000 units/hour',
        interfaces: ['PLC', 'HMI'],
      },
      manufactureDate: new Date('2025-01-10'),
      warrantyExpiryDate: new Date('2027-01-10'),
      supplierId: supplier1.id,
      customerId: customer1.id,
      currentLocation: 'ABC Manufacturing - Production Line A',
      createdBy: operatorUser.id,
      updatedBy: operatorUser.id,
    });
  }

  const existingPassport2 = await passportRepo.findOne({ where: { passportCode: passportCode2 } });
  if (!existingPassport2) {
    await passportRepo.save({
      passportCode: passportCode2,
      productLine: ProductLine.IP,
      originCode: OriginCode.DE,
      status: DeviceStatus.IN_QC,
      deviceName: 'Siemens S7-1500 PLC Controller',
      deviceModel: 'S7-1500',
      manufacturer: 'Siemens',
      manufacturerPartNumber: '6ES7511-1AK02-0AB0',
      serialNumber: 'SN-2025-002',
      specifications: {
        voltage: '24V DC',
        memory: '150KB',
        interfaces: ['PROFINET', 'PROFIBUS'],
      },
      manufactureDate: new Date('2025-01-15'),
      warrantyExpiryDate: new Date('2027-01-15'),
      supplierId: supplier1.id,
      currentLocation: 'QC Department',
      createdBy: operatorUser.id,
      updatedBy: qcUser.id,
    });
  }

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
