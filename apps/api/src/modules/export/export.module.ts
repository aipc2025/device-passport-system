import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExportController } from './export.controller';
import { ExportService } from './export.service';
import {
  DevicePassport,
  LifecycleEvent,
  ServiceOrder,
  User,
  Organization,
} from '../../database/entities';

@Module({
  imports: [
    TypeOrmModule.forFeature([DevicePassport, LifecycleEvent, ServiceOrder, User, Organization]),
  ],
  controllers: [ExportController],
  providers: [ExportService],
  exports: [ExportService],
})
export class ExportModule {}
