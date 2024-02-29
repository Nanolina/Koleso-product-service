import { Module } from '@nestjs/common';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';
import { LoggerModule } from '../logger/logger.module';
import { PrismaService } from '../prisma/prisma.service';
import { VariantService } from './variant.service';

@Module({
  imports: [LoggerModule, CloudinaryModule],
  providers: [VariantService, PrismaService],
})
export class VariantModule {}
