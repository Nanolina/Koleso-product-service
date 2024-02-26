import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import { CreateVariantsDto } from '../variant/dto';
import { VariantService } from '../variant/variant.service';
import { CreateProductDto } from './dto/create-product.dto';
import { ProductService } from './product.service';

@Controller('product')
export class ProductController {
  constructor(
    private readonly productService: ProductService,
    private readonly variantService: VariantService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createProductDto: CreateProductDto, @Req() req: Request) {
    return this.productService.create(createProductDto, req.user.id);
  }

  @Get()
  findAll(@Req() req: Request) {
    return this.productService.findAll(req.user.id);
  }

  @Post(':id/variants')
  createVariants(
    @Param('id') id: string,
    @Body() createVariantsDto: CreateVariantsDto,
    @Req() req: Request,
  ) {
    return this.variantService.create(createVariantsDto, id, req.user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: Request) {
    return this.productService.findOne(id, req.user.id);
  }
}
