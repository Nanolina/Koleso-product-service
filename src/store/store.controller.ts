import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import { CreateStoreDto } from './dto/create-store.dto';
import { StoreService } from './store.service';

@Controller('store')
export class StoreController {
  constructor(private readonly storeService: StoreService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createStoreDto: CreateStoreDto, @Req() req: Request) {
    return this.storeService.create(createStoreDto, req.user.id);
  }

  @Get()
  findAll(@Req() req: Request) {
    return this.storeService.findAll(req.user.id);
  }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.storeService.findOne(+id);
  // }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateStoreDto: UpdateStoreDto) {
  //   return this.storeService.update(+id, updateStoreDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.storeService.remove(+id);
  // }
}
