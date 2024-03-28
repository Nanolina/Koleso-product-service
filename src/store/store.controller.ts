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
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Request } from 'express';
import { OrganizationId } from '../common/decorators';
import { OrganizationIdGuard } from '../common/guards';
import { MyLogger } from '../logger/my-logger.service';
import { imageUploadOptions } from '../utils';
import { CreateStoreDto, UpdateStoreDto } from './dto';
import { StoreService } from './store.service';

@Controller('store')
@UseGuards(OrganizationIdGuard)
export class StoreController {
  constructor(
    private readonly storeService: StoreService,
    private readonly logger: MyLogger,
  ) {}

  @Post()
  @UseInterceptors(FileInterceptor('image', imageUploadOptions))
  @HttpCode(HttpStatus.CREATED)
  create(
    @Body() createStoreDto: CreateStoreDto,
    @UploadedFile() image: Express.Multer.File,
    @Req() req: Request,
    @OrganizationId() organizationId: string,
  ) {
    return this.storeService.create(
      createStoreDto,
      organizationId,
      req.user.id,
      image,
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
      this.logger.error({
        method: 'store-findAll-parse-filter',
        error,
      });
    }

    return this.storeService.findAll({
      organizationId,
      filter,
    });
  }

  @Get(':id')
  findOne(@Param('id') id: string, @OrganizationId() organizationId: string) {
    return this.storeService.findOne(id, organizationId);
  }

  @Patch(':id')
  @UseInterceptors(FileInterceptor('image', imageUploadOptions))
  update(
    @Param('id') id: string,
    @Body() updateStoreDto: UpdateStoreDto,
    @UploadedFile() image: Express.Multer.File,
    @Req() req: Request,
    @OrganizationId() organizationId: string,
  ) {
    return this.storeService.update(
      updateStoreDto,
      id,
      organizationId,
      req.user.id,
      image,
    );
  }

  @Post(':id/recover')
  recover(
    @Param('id') id: string,
    @Req() req: Request,
    @OrganizationId() organizationId: string,
  ) {
    return this.storeService.recover(id, organizationId, req.user.id);
  }

  @Delete(':id')
  remove(
    @Param('id') id: string,
    @Req() req: Request,
    @OrganizationId() organizationId: string,
  ) {
    return this.storeService.remove(id, organizationId, req.user.id);
  }
}
