import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProductCustomerService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return await this.prisma.product.findMany();
  }

  async findOne(id: string) {
    return await this.prisma.product.findFirst({
      where: {
        id,
      },
    });
  }
}
