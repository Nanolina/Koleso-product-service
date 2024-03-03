import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { Request } from 'express';
import { UpdateImagesForVariantsDto } from '../image/dto';
import { ImageService } from '../image/image.service';
import { UpdateVariantsDto } from '../variant/dto';
import { VariantService } from '../variant/variant.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductService } from './product.service';

@Controller('product')
export class ProductController {
  constructor(
    private readonly productService: ProductService,
    private readonly variantService: VariantService,
    private readonly imageService: ImageService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createProductDto: CreateProductDto, @Req() req: Request) {
    return this.productService.create(createProductDto, req.user.id);
  }

  @Get()
  findAll(@Query('filter') filter: string, @Req() req: Request) {
    return this.productService.findAll(req.user.id, filter);
  }

  @Post(':id/recover')
  recover(@Param('id') id: string, @Req() req: Request) {
    return this.productService.recover(id, req.user.id);
  }

  @Post(':id/variants')
  updateVariants(
    @Param('id') id: string,
    @Body() updateVariantsDto: UpdateVariantsDto,
    @Req() req: Request,
  ) {
    return this.variantService.update(updateVariantsDto, id, req.user.id);
  }

  @Post(':id/images')
  @UseInterceptors(AnyFilesInterceptor())
  async updateProductImages(
    @Param('id') id: string,
    @Body() existingImagesURL: UpdateImagesForVariantsDto,
    @UploadedFiles() files: Array<Express.Multer.File>,
    @Req() req: Request,
  ) {
    return this.imageService.update(id, files, existingImagesURL, req.user.id);
  }

  @Get(':id/images')
  findImages(@Param('id') id: string, @Req() req: Request) {
    return this.imageService.findAll(id, req.user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: Request) {
    return this.productService.findOne(id, req.user.id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
    @Req() req: Request,
  ) {
    return this.productService.update(updateProductDto, id, req.user.id);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req: Request) {
    return this.productService.remove(id, req.user.id);
  }
}
