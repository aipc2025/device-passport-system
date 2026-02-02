import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../../database/entities';
import { PermissionService } from './permission.service';
import { PermissionGuard } from './permission.guard';
import { WorkflowService } from './workflow.service';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [PermissionService, PermissionGuard, WorkflowService],
  exports: [PermissionService, PermissionGuard, WorkflowService],
})
export class PermissionModule {}
