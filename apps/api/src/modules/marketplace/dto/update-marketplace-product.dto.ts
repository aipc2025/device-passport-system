import { PartialType } from '@nestjs/swagger';
import { CreateMarketplaceProductDto } from './create-marketplace-product.dto';

export class UpdateMarketplaceProductDto extends PartialType(CreateMarketplaceProductDto) {}
