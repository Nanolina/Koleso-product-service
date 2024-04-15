import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ProductCustomerController } from './product-customer.controller';
import { ProductCustomerService } from './product-customer.service';

@Module({
  controllers: [ProductCustomerController],
  providers: [ProductCustomerService, PrismaService],
})
export class ProductCustomerModule {}
