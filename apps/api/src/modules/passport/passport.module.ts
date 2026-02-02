import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportService } from './passport.service';
import { PassportController } from './passport.controller';
import { PassportCodeService } from './passport-code.service';
import { DevicePassport, SequenceCounter, Organization, User } from '../../database/entities';
import { LifecycleModule } from '../lifecycle/lifecycle.module';
import { PermissionModule } from '../permission/permission.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([DevicePassport, SequenceCounter, Organization, User]),
    LifecycleModule,
    PermissionModule,
  ],
  controllers: [PassportController],
  providers: [PassportService, PassportCodeService],
  exports: [PassportService, PassportCodeService],
})
export class PassportModule {}
