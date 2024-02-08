import { Controller, Get, Req } from '@nestjs/common';
import { Request } from 'express';
import { ProductService } from './product.service';

@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get()
  findAll(@Req() req: Request) {
    return this.productService.findAll(req.user.id);
  }
}
