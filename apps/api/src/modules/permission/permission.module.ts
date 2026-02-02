import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../../database/entities';
import { PermissionService } from './permission.service';
import { PermissionGuard } from './permission.guard';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [PermissionService, PermissionGuard],
  exports: [PermissionService, PermissionGuard],
})
export class PermissionModule {}
