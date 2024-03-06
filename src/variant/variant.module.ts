import { Module } from '@nestjs/common';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';
import { ImageService } from '../image/image.service';
import { LoggerModule } from '../logger/logger.module';
import { PrismaService } from '../prisma/prisma.service';
import { VariantController } from './variant.controller';
import { VariantService } from './variant.service';

@Module({
  imports: [LoggerModule, CloudinaryModule],
  controllers: [VariantController],
  providers: [VariantService, PrismaService, ImageService],
})
export class VariantModule {}
