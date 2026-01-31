import { Module, OnModuleInit } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductTypeConfig } from '../../database/entities';
import { ProductTypeService } from './product-type.service';
import { ProductTypeController } from './product-type.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ProductTypeConfig])],
  controllers: [ProductTypeController],
  providers: [ProductTypeService],
  exports: [ProductTypeService],
})
export class ProductTypeModule implements OnModuleInit {
  constructor(private readonly productTypeService: ProductTypeService) {}

  async onModuleInit() {
    await this.productTypeService.seedDefaultTypes();
  }
}
