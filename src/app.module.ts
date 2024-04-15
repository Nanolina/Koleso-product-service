import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { CatalogModule } from './catalog/catalog.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { ImageModule } from './image/image.module';
import { LoggerModule } from './logger/logger.module';
import { PrismaService } from './prisma/prisma.service';
import { ProductCustomerModule } from './product-customer/product-customer.module';
import { ProductSellerModule } from './product-seller/product-seller.module';
import { StoreModule } from './store/store.module';
import { VariantModule } from './variant/variant.module';

@Module({
  imports: [
    LoggerModule,
    AuthModule,
    StoreModule,
    ProductSellerModule,
    ProductCustomerModule,
    CloudinaryModule,
    CatalogModule,
    VariantModule,
    ImageModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
  providers: [PrismaService],
})
export class AppModule {}
