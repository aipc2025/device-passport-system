import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServiceOrderService } from './service-order.service';
import { ServiceOrderController } from './service-order.controller';
import { ServiceRecordService } from './service-record.service';
import {
  ServiceOrder,
  ServiceRecord,
  DevicePassport,
  Organization,
  User,
} from '../../database/entities';
import { LifecycleModule } from '../lifecycle/lifecycle.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ServiceOrder, ServiceRecord, DevicePassport, Organization, User]),
    LifecycleModule,
  ],
  controllers: [ServiceOrderController],
  providers: [ServiceOrderService, ServiceRecordService],
  exports: [ServiceOrderService, ServiceRecordService],
})
export class ServiceOrderModule {}
