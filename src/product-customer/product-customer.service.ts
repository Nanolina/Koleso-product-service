import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

const args = {
  include: {
    store: {
      select: {
        name: true,
        id: true,
        organizationId: true,
      },
    },
    variants: {
      where: {
        isActive: true,
      },
      include: {
        images: {
          select: {
            url: true,
          },
        },
      },
    },
  },
};
@Injectable()
export class ProductCustomerService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.product.findMany({
      where: {
        isActive: true,
      },
      ...args,
    });
  }

  async findOne(id: string) {
    return this.prisma.product.findFirst({
      where: {
        id,
        isActive: true,
      },
      ...args,
    });
  }
}
