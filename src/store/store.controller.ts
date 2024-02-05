import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Req,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Request } from 'express';
import { UpdateStoreDto } from './dto';
import { CreateStoreDto } from './dto/create-store.dto';
import { StoreService } from './store.service';

@Controller('store')
export class StoreController {
  constructor(private readonly storeService: StoreService) {}

  @Post()
  @UseInterceptors(FileInterceptor('logo'))
  @HttpCode(HttpStatus.CREATED)
  create(
    @Body() createStoreDto: CreateStoreDto,
    @UploadedFile() logo: Express.Multer.File,
    @Req() req: Request,
  ) {
    return this.storeService.create(createStoreDto, req.user.id, logo);
  }

  @Get()
  findAll(@Req() req: Request) {
    return this.storeService.findAll(req.user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: Request) {
    return this.storeService.findOne(id, req.user.id);
  }

  @Patch(':id')
  @UseInterceptors(FileInterceptor('logo'))
  update(
    @Param('id') id: string,
    @Body() updateStoreDto: UpdateStoreDto,
    @UploadedFile() logo: Express.Multer.File,
    @Req() req: Request,
  ) {
    return this.storeService.update(updateStoreDto, id, req.user.id, logo);
  }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.storeService.remove(+id);
  // }
}
