import { Module } from '@nestjs/common';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';
import { LoggerModule } from '../logger/logger.module';
import { PrismaService } from '../prisma/prisma.service';
import { ProductService } from '../product/product.service';
import { ImageService } from './image.service';

@Module({
  imports: [LoggerModule, CloudinaryModule],
  providers: [ImageService, PrismaService, ProductService],
})
export class ImageModule {}
