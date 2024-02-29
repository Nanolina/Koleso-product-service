import { Module } from '@nestjs/common';
import { VariantService } from 'src/variant/variant.service';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';
import { LoggerModule } from '../logger/logger.module';
import { PrismaService } from '../prisma/prisma.service';
import { ImageService } from './image.service';

@Module({
  imports: [LoggerModule, CloudinaryModule],
  providers: [ImageService, PrismaService, VariantService],
})
export class ImageModule {}
