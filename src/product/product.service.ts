import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { UNKNOWN_ERROR_TRY } from '../consts';
import { MyLogger } from '../logger/my-logger.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto';
import { IParameter } from './types';

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
      dto.parameters.forEach(async (parameter: IParameter) => {
        await this.prisma.product.create({
          data: {
            userId,
            name: dto.name,
            groupId: dto.groupId,
            description: dto.description,
            brand: dto.brand,
            model: dto.model,
            articleSupplier: dto.articleSupplier,
            priceWithoutDiscount: dto.priceWithoutDiscount,
            finalPrice: dto.finalPrice,
            gender: dto.gender,
            image: '',
            imagePublicId: '',
            articleKoleso: '',
            composition: compositionJson,
            color: parameter.color,
            quantity: parameter.quantity,
            size: parameter.size,
            store: {
              connect: {
                id: dto.storeId,
              },
            },
            ...catalogStructure,
          },
        });
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

  async findGroupIds(userId: string) {
    return this.prisma.product.groupBy({
      by: ['groupId', 'name', 'finalPrice', 'brand', 'model'],
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
