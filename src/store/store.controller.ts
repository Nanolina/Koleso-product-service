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
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Request } from 'express';
import { imageUploadOptions } from 'src/utils';
import { UpdateStoreDto } from './dto';
import { CreateStoreDto } from './dto/create-store.dto';
import { StoreService } from './store.service';

@Controller('store')
export class StoreController {
  constructor(private readonly storeService: StoreService) {}

  @Post()
  @UseInterceptors(FileInterceptor('image', imageUploadOptions))
  @HttpCode(HttpStatus.CREATED)
  create(
    @Body() createStoreDto: CreateStoreDto,
    @UploadedFile() image: Express.Multer.File,
    @Req() req: Request,
  ) {
    return this.storeService.create(createStoreDto, req.user.id, image);
  }

  @Get()
  findAll(@Query('filter') filter: string, @Req() req: Request) {
    return this.storeService.findAll(req.user.id, filter);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: Request) {
    return this.storeService.findOne(id, req.user.id);
  }

  @Patch(':id')
  @UseInterceptors(FileInterceptor('image', imageUploadOptions))
  update(
    @Param('id') id: string,
    @Body() updateStoreDto: UpdateStoreDto,
    @UploadedFile() image: Express.Multer.File,
    @Req() req: Request,
  ) {
    return this.storeService.update(updateStoreDto, id, req.user.id, image);
  }

  @Post(':id/recover')
  recover(@Param('id') id: string, @Req() req: Request) {
    return this.storeService.recover(id, req.user.id);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: Request) {
    return this.storeService.remove(id, req.user.id);
  }
}
