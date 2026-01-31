import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExpertController } from './expert.controller';
import { ExpertService } from './expert.service';
import { IndividualExpert, ServiceOrder } from '../../database/entities';

@Module({
  imports: [TypeOrmModule.forFeature([IndividualExpert, ServiceOrder])],
  controllers: [ExpertController],
  providers: [ExpertService],
  exports: [ExpertService],
})
export class ExpertModule {}
