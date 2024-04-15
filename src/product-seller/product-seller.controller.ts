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
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { Request } from 'express';
import { OrganizationId } from '../common/decorators';
import { OrganizationIdGuard } from '../common/guards';
import { UpdateImagesForVariantsDto } from '../image/dto';
import { ImageService } from '../image/image.service';
import { MyLogger } from '../logger/my-logger.service';
import { UpdateVariantsDto } from '../variant/dto';
import { VariantService } from '../variant/variant.service';
import { CreateProductDto, UpdateProductDto } from './dto';
import { ProductSellerService } from './product-seller.service';

@Controller('seller/product')
@UseGuards(OrganizationIdGuard)
export class ProductSellerController {
  constructor(
    private readonly productService: ProductSellerService,
    private readonly variantService: VariantService,
    private readonly imageService: ImageService,
    private readonly logger: MyLogger,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(
    @Body() createProductDto: CreateProductDto,
    @Req() req: Request,
    @OrganizationId() organizationId: string,
  ) {
    return this.productService.create(
      createProductDto,
      organizationId,
      req.user.id,
    );
  }

  @Get()
  findAll(
    @Query('filter') filterString: string,
    @OrganizationId() organizationId: string,
  ) {
    // Parse filter query
    let filter;
    try {
      filter = JSON.parse(filterString);
    } catch (error) {
      filter = {};
      this.logger.error({
        method: 'product-findAll-parse-filter',
        error,
      });
    }

    return this.productService.findAll({
      filter,
      organizationId,
    });
  }

  @Post(':id/recover')
  recover(
    @Param('id') id: string,
    @Req() req: Request,
    @OrganizationId() organizationId: string,
  ) {
    return this.productService.recover(id, organizationId, req.user.id);
  }

  @Post(':id/variants')
  updateVariants(
    @Param('id') id: string,
    @Body() updateVariantsDto: UpdateVariantsDto,
    @OrganizationId() organizationId: string,
  ) {
    return this.variantService.update(updateVariantsDto, id, organizationId);
  }

  @Post(':id/images')
  @UseInterceptors(AnyFilesInterceptor())
  async updateProductImages(
    @Param('id') id: string,
    @Body() existingImagesURL: UpdateImagesForVariantsDto,
    @UploadedFiles() files: Array<Express.Multer.File>,
    @OrganizationId() organizationId: string,
  ) {
    return this.imageService.update(
      id,
      organizationId,
      files,
      existingImagesURL,
    );
  }

  @Get(':id/images')
  findImages(
    @Param('id') id: string,
    @OrganizationId() organizationId: string,
  ) {
    return this.imageService.findAll(id, organizationId);
  }

  @Get(':id')
  findOne(
    @Query('filterVariants') filterVariantsString: string,
    @Param('id') id: string,
    @OrganizationId() organizationId: string,
  ) {
    // Parse filter query
    let filterVariants;
    try {
      filterVariants = JSON.parse(filterVariantsString);
    } catch (error) {
      filterVariants = {};
      this.logger.error({
        method: 'product-findOne-parse-filter',
        error,
      });
    }

    return this.productService.findOne({
      id,
      organizationId,
      filterVariants,
    });
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
    @Req() req: Request,
    @OrganizationId() organizationId: string,
  ) {
    return this.productService.update(
      updateProductDto,
      id,
      organizationId,
      req.user.id,
    );
  }

  @Delete(':id')
  async remove(
    @Param('id') id: string,
    @Req() req: Request,
    @OrganizationId() organizationId: string,
  ) {
    return this.productService.remove(id, organizationId, req.user.id);
  }
}
