import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RegistrationController } from './registration.controller';
import { RegistrationService } from './registration.service';
import {
  User,
  Organization,
  CompanyProfile,
  OrganizationContact,
  SupplierProduct,
  IndividualExpert,
  UploadedFile,
} from '../../database/entities';
import { UploadModule } from '../upload/upload.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Organization,
      CompanyProfile,
      OrganizationContact,
      SupplierProduct,
      IndividualExpert,
      UploadedFile,
    ]),
    UploadModule,
  ],
  controllers: [RegistrationController],
  providers: [RegistrationService],
  exports: [RegistrationService],
})
export class RegistrationModule {}
