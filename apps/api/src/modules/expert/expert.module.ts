import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExpertController } from './expert.controller';
import { ExpertService } from './expert.service';
import { ExpertCodeService } from './expert-code.service';
import { IndividualExpert, ServiceOrder, ExpertSequenceCounter } from '../../database/entities';

@Module({
  imports: [TypeOrmModule.forFeature([IndividualExpert, ServiceOrder, ExpertSequenceCounter])],
  controllers: [ExpertController],
  providers: [ExpertService, ExpertCodeService],
  exports: [ExpertService, ExpertCodeService],
})
export class ExpertModule {}
