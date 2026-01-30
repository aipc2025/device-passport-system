import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScanController } from './scan.controller';
import { ScanService } from './scan.service';
import { DevicePassport } from '../../database/entities';

@Module({
  imports: [TypeOrmModule.forFeature([DevicePassport])],
  controllers: [ScanController],
  providers: [ScanService],
})
export class ScanModule {}
