import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScanController } from './scan.controller';
import { ScanService } from './scan.service';
import { DevicePassport } from '../../database/entities';
import { ExpertModule } from '../expert/expert.module';

@Module({
  imports: [TypeOrmModule.forFeature([DevicePassport]), ExpertModule],
  controllers: [ScanController],
  providers: [ScanService],
})
export class ScanModule {}
