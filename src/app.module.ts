import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { LoggerModule } from './logger/logger.module';
import { PrismaService } from './prisma/prisma.service';
import { StoreModule } from './store/store.module';

@Module({
  imports: [
    LoggerModule,
    AuthModule,
    StoreModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    CloudinaryModule,
  ],
  providers: [PrismaService],
})
export class AppModule {}
