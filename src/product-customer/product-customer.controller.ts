import { Controller, Get, Param } from '@nestjs/common';
import { ProductCustomerService } from './product-customer.service';

@Controller('customer/product')
export class ProductCustomerController {
  constructor(private readonly productService: ProductCustomerService) {}

  @Get()
  findAll() {
    return this.productService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productService.findOne(id);
  }
}
