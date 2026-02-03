import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import { parsePassportCode, validateExpertPassportCode } from '@device-passport/shared';

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
  synchronize: false,
  logging: true,
});

async function cleanup() {
  console.log('Connecting to database...');
  await AppDataSource.initialize();

  const passportRepo = AppDataSource.getRepository('DevicePassport');
  const expertRepo = AppDataSource.getRepository('IndividualExpert');
  const sequenceRepo = AppDataSource.getRepository('SequenceCounter');
  const expertSequenceRepo = AppDataSource.getRepository('ExpertPassportSequence');

  console.log('\n========================================');
  console.log('CLEANUP: Removing non-conforming passport codes');
  console.log('========================================\n');

  // 1. Find and delete non-conforming device passports
  console.log('1. Checking Device Passports...\n');
  const allPassports = await passportRepo.find();
  const invalidPassports: any[] = [];

  for (const passport of allPassports) {
    const code = passport.passportCode;
    const parsed = parsePassportCode(code);

    if (!parsed) {
      console.log(`  [INVALID] ${code} - Cannot be parsed with new format`);
      invalidPassports.push(passport);
    } else {
      console.log(`  [OK] ${code}`);
    }
  }

  if (invalidPassports.length > 0) {
    console.log(`\nDeleting ${invalidPassports.length} invalid device passports...`);

    // Get repositories for related tables
    const lifecycleRepo = AppDataSource.getRepository('LifecycleEvent');
    const serviceOrderRepo = AppDataSource.getRepository('ServiceOrder');
    const qcRecordRepo = AppDataSource.getRepository('QCRecord');

    for (const passport of invalidPassports) {
      console.log(`  Deleting: ${passport.passportCode} (ID: ${passport.id})`);

      // Delete related lifecycle events
      try {
        await lifecycleRepo.delete({ passportId: passport.id });
        console.log(`    - Deleted lifecycle events`);
      } catch (e) {
        // Ignore if table doesn't exist
      }

      // Delete related service orders
      try {
        await serviceOrderRepo.delete({ passportId: passport.id });
        console.log(`    - Deleted service orders`);
      } catch (e) {
        // Ignore if table doesn't exist
      }

      // Delete related QC records
      try {
        await qcRecordRepo.delete({ passportId: passport.id });
        console.log(`    - Deleted QC records`);
      } catch (e) {
        // Ignore if table doesn't exist
      }

      // Now delete the passport
      await passportRepo.delete(passport.id);
      console.log(`    - Deleted passport`);
    }
    console.log('Device passports cleanup complete.\n');
  } else {
    console.log('\nNo invalid device passports found.\n');
  }

  // 2. Find and clear non-conforming expert passport codes
  console.log('2. Checking Expert Passports...\n');
  const allExperts = await expertRepo.find();
  const invalidExperts: any[] = [];

  for (const expert of allExperts) {
    if (!expert.expertCode) {
      console.log(`  [NO CODE] ${expert.personalName} (${expert.email})`);
      continue;
    }

    const validation = validateExpertPassportCode(expert.expertCode);

    if (!validation.valid) {
      console.log(
        `  [INVALID] ${expert.expertCode} - ${expert.personalName} (${expert.email}) - ${validation.error}`
      );
      invalidExperts.push(expert);
    } else {
      console.log(`  [OK] ${expert.expertCode} - ${expert.personalName}`);
    }
  }

  if (invalidExperts.length > 0) {
    console.log(`\nClearing ${invalidExperts.length} invalid expert passport codes...`);
    for (const expert of invalidExperts) {
      console.log(`  Clearing code for: ${expert.personalName} (was: ${expert.expertCode})`);
      await expertRepo.update(expert.id, {
        expertCode: null,
        expertCodeGeneratedAt: null,
        expertTypeCode: null,
      });
    }
    console.log('Expert passport codes cleanup complete.\n');
  } else {
    console.log('\nNo invalid expert passport codes found.\n');
  }

  // 3. Reset sequence counters for device passports if needed
  if (invalidPassports.length > 0) {
    console.log('3. Resetting sequence counters...\n');
    // Get the count of remaining valid passports per sequence key
    const remainingPassports = await passportRepo.find();
    const sequenceMap = new Map<string, number>();

    for (const passport of remainingPassports) {
      const parsed = parsePassportCode(passport.passportCode);
      if (parsed) {
        const key = `${parsed.companyCode}-${parsed.yearMonth}-${parsed.productType}-${parsed.originCode}`;
        const current = sequenceMap.get(key) || 0;
        sequenceMap.set(key, Math.max(current, parsed.sequence));
      }
    }

    console.log('Sequence counters summary:');
    for (const [key, maxSeq] of sequenceMap) {
      console.log(`  ${key}: max sequence = ${maxSeq}`);
    }
    console.log('');
  }

  // 4. Summary
  console.log('========================================');
  console.log('CLEANUP SUMMARY');
  console.log('========================================');
  console.log(`Device Passports deleted: ${invalidPassports.length}`);
  console.log(`Expert Codes cleared: ${invalidExperts.length}`);

  const remainingDevicePassports = await passportRepo.count();
  const remainingExpertCodes = await expertRepo.count({ where: { expertCode: null } });
  const totalExperts = await expertRepo.count();

  console.log(`\nRemaining valid device passports: ${remainingDevicePassports}`);
  console.log(
    `Experts with passport codes: ${totalExperts - remainingExpertCodes}/${totalExperts}`
  );
  console.log('========================================\n');

  await AppDataSource.destroy();
  console.log('Database connection closed.');
}

cleanup().catch((error) => {
  console.error('Cleanup failed:', error);
  process.exit(1);
});
