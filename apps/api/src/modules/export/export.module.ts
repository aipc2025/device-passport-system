import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExportController } from './export.controller';
import { ExportService } from './export.service';
import { DevicePassport } from '../entities/device-passport.entity';
import { LifecycleEvent } from '../entities/lifecycle-event.entity';
import { ServiceOrder } from '../entities/service-order.entity';
import { User } from '../entities/user.entity';
import { Organization } from '../entities/organization.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      DevicePassport,
      LifecycleEvent,
      ServiceOrder,
      User,
      Organization,
    ]),
  ],
  controllers: [ExportController],
  providers: [ExportService],
  exports: [ExportService],
})
export class ExportModule {}
