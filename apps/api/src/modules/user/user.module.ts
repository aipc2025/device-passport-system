import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { OrganizationService } from './organization.service';
import { OrganizationController } from './organization.controller';
import { User, Organization } from '../../database/entities';

@Module({
  imports: [TypeOrmModule.forFeature([User, Organization])],
  controllers: [UserController, OrganizationController],
  providers: [UserService, OrganizationService],
  exports: [UserService, OrganizationService],
})
export class UserModule {}
