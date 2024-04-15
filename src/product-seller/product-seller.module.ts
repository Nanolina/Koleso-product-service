import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';
import { ImageService } from '../image/image.service';
import { LoggerModule } from '../logger/logger.module';
import { PrismaService } from '../prisma/prisma.service';
import { VariantService } from '../variant/variant.service';
import { ProductSellerController } from './product-seller.controller';
import { ProductSellerService } from './product-seller.service';

@Module({
  imports: [LoggerModule, AuthModule, CloudinaryModule],
  controllers: [ProductSellerController],
  providers: [
    ProductSellerService,
    PrismaService,
    VariantService,
    ImageService,
  ],
})
export class ProductSellerModule {}
