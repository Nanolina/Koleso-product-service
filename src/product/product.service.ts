import { Injectable } from '@nestjs/common';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { MyLogger } from '../logger/my-logger.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProductService {
  constructor(
    private prisma: PrismaService,
    private cloudinaryService: CloudinaryService,
    private readonly logger: MyLogger,
  ) {}
  async findAll(userId: string) {
    return this.prisma.product.findMany({
      where: {
        userId,
      },
    });
  }

  async findOne(id: string, userId: string) {
    return this.prisma.product.findFirst({
      where: {
        id,
        userId,
      },
    });
  }
}
