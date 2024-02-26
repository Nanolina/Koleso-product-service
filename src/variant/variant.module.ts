import { Module } from '@nestjs/common';
import { LoggerModule } from '../logger/logger.module';
import { PrismaService } from '../prisma/prisma.service';
import { VariantService } from './variant.service';

@Module({
  imports: [LoggerModule],
  providers: [VariantService, PrismaService],
})
export class VariantModule {}
