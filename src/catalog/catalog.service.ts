import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CatalogService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.section.findMany({
      include: {
        categories: {
          include: {
            subcategories: {
              orderBy: {
                name: 'asc',
              },
            },
          },
          orderBy: {
            name: 'asc',
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });
  }
}
