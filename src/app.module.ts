import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { CatalogModule } from './catalog/catalog.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { LoggerModule } from './logger/logger.module';
import { PrismaService } from './prisma/prisma.service';
import { ProductModule } from './product/product.module';
import { StoreModule } from './store/store.module';
import { VariantModule } from './variant/variant.module';

@Module({
  imports: [
    LoggerModule,
    AuthModule,
    StoreModule,
    ProductModule,
    CloudinaryModule,
    CatalogModule,
    VariantModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
  providers: [PrismaService],
})
export class AppModule {}
