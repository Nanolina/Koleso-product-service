import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';
import { LoggerModule } from '../logger/logger.module';
import { PrismaService } from '../prisma/prisma.service';
import { VariantService } from '../variant/variant.service';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';

@Module({
  imports: [LoggerModule, AuthModule, CloudinaryModule],
  controllers: [ProductController],
  providers: [ProductService, PrismaService, VariantService],
})
export class ProductModule {}
