import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { UNKNOWN_ERROR_TRY } from '../consts';
import { MyLogger } from '../logger/my-logger.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto';

@Injectable()
export class ProductService {
  constructor(
    private prisma: PrismaService,
    private cloudinaryService: CloudinaryService,
    private readonly logger: MyLogger,
  ) {}

  async create(dto: CreateProductDto, userId: string) {
    try {
      return await this.prisma.product.create({
        data: {
          userId,
          name: dto.name,
          description: dto.description,
          articleSupplier: dto.articleSupplier,
          brand: dto.brand,
          model: dto.model,
          image: '',
          imagePublicId: '',
          articleKoleso: '',
          priceWithoutDiscount: 0,
          finalPrice: 0,
          color: 'White',
          quantity: 0,
          sectionId: 1,
          storeId: '14549e9c-648a-47b5-bb8b-ca1966d41e11',
        },
      });
    } catch (error) {
      this.logger.error({ method: 'create', error });

      throw new InternalServerErrorException(UNKNOWN_ERROR_TRY);
    }
  }

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
