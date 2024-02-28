import { Injectable } from '@nestjs/common';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { MyLogger } from '../logger/my-logger.service';
import { PrismaService } from '../prisma/prisma.service';
import { ProductService } from '../product/product.service';

@Injectable()
export class ImageService {
  constructor(
    private prisma: PrismaService,
    private readonly logger: MyLogger,
    private readonly cloudinaryService: CloudinaryService,
    private readonly productService: ProductService,
  ) {}

  async findAll(productId: string, userId: string) {
    await this.productService.findOneWithoutVariants(productId, userId);

    return await this.prisma.image.findMany({
      where: {
        variant: {
          productId,
        },
      },
    });
  }
}
