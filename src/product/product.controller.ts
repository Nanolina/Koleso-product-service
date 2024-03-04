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
import { MyLogger } from '../logger/my-logger.service';
import { UpdateVariantsDto } from '../variant/dto';
import { VariantService } from '../variant/variant.service';
import { CreateProductDto, UpdateProductDto } from './dto';
import { ProductService } from './product.service';

@Controller('product')
export class ProductController {
  constructor(
    private readonly productService: ProductService,
    private readonly variantService: VariantService,
    private readonly imageService: ImageService,
    private readonly logger: MyLogger,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createProductDto: CreateProductDto, @Req() req: Request) {
    return this.productService.create(createProductDto, req.user.id);
  }

  @Get()
  findAll(@Query('filter') filterString: string, @Req() req: Request) {
    // Parse filter query
    let filter;
    try {
      filter = JSON.parse(filterString);
    } catch (error) {
      this.logger.error({
        method: 'product-findAll-parse-filter',
        error,
      });
    }

    return this.productService.findAll({ filter, userId: req.user.id });
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
  findOne(
    @Query('filterVariants') filterVariantsString: string,
    @Param('id') id: string,
    @Req() req: Request,
  ) {
    // Parse filter query
    let filterVariants;
    try {
      filterVariants = JSON.parse(filterVariantsString);
    } catch (error) {
      this.logger.error({
        method: 'product-findOne-parse-filter',
        error,
      });
    }

    return this.productService.findOne({
      id,
      filterVariants,
      userId: req.user.id,
    });
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
