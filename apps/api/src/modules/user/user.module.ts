import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { OrganizationService } from './organization.service';
import { OrganizationController } from './organization.controller';
import { ContactService } from './contact.service';
import { ContactController } from './contact.controller';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import {
  User,
  Organization,
  OrganizationContact,
  SupplierProduct,
} from '../../database/entities';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Organization,
      OrganizationContact,
      SupplierProduct,
    ]),
  ],
  controllers: [
    UserController,
    OrganizationController,
    ContactController,
    ProductController,
  ],
  providers: [
    UserService,
    OrganizationService,
    ContactService,
    ProductService,
  ],
  exports: [
    UserService,
    OrganizationService,
    ContactService,
    ProductService,
  ],
})
export class UserModule {}
