import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { UNKNOWN_ERROR_TRY } from '../consts';
import { MyLogger } from '../logger/my-logger.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto';

const includeVariants = {
  include: {
    variants: true,
  },
};

@Injectable()
export class ProductService {
  constructor(
    private prisma: PrismaService,
    private cloudinaryService: CloudinaryService,
    private readonly logger: MyLogger,
  ) {}

  async create(dto: CreateProductDto, userId: string) {
    // Catalog structure
    const categoryId = dto.categoryId;
    const subcategoryId = dto.subcategoryId;
    const catalogStructure = {
      section: {
        connect: {
          id: dto.sectionId,
        },
      },
      ...(categoryId && {
        category: {
          connect: {
            id: categoryId,
          },
        },
      }),
      ...(subcategoryId && {
        subcategory: {
          connect: {
            id: subcategoryId,
          },
        },
      }),
    };

    // Convert composition to JSON
    const compositionJson = dto.composition.map((comp) => ({
      title: comp.title,
      percentage: comp.percentage,
    }));

    // Create
    try {
      return await this.prisma.product.create({
        data: {
          userId,
          name: dto.name,
          description: dto.description,
          brand: dto.brand,
          model: dto.model,
          gender: dto.gender,
          composition: compositionJson,
          store: {
            connect: {
              id: dto.storeId,
            },
          },
          ...catalogStructure,
          variants: {
            create: dto.variants.map((variant) => ({
              color: variant.color,
              size: variant.size,
              quantity: variant.quantity,
              priceWithoutDiscount: variant.priceWithoutDiscount,
              finalPrice: variant.finalPrice,
              articleSupplier: variant.articleSupplier,
              articleKoleso: '',
            })),
          },
        },
        ...includeVariants,
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
      ...includeVariants,
    });
  }

  async findOne(id: string, userId: string) {
    return this.prisma.product.findFirst({
      where: {
        id,
        userId,
      },
      ...includeVariants,
    });
  }
}
