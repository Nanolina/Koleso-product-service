import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';
import { LoggerModule } from '../logger/logger.module';
import { PrismaService } from '../prisma/prisma.service';
import { StoreController } from './store.controller';
import { StoreService } from './store.service';

@Module({
  imports: [LoggerModule, AuthModule, CloudinaryModule],
  controllers: [StoreController],
  providers: [StoreService, PrismaService],
})
export class StoreModule {}
