import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { UNKNOWN_ERROR_TRY } from '../consts';
import { MyLogger } from '../logger/my-logger.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

const includeVariants = {
  include: {
    variants: {
      where: {
        isActive: true,
      },
    },
  },
};

@Injectable()
export class ProductService {
  constructor(
    private prisma: PrismaService,
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
          gender: dto.gender || null,
          composition: compositionJson,
          store: {
            connect: {
              id: dto.storeId,
            },
          },
          ...catalogStructure,
        },
        ...includeVariants,
      });
    } catch (error) {
      this.logger.error({ method: 'product-create', error });

      throw new InternalServerErrorException(UNKNOWN_ERROR_TRY);
    }
  }

  async findAll(userId: string, filter: string = 'active') {
    return this.prisma.product.findMany({
      where: {
        userId,
        isActive: filter === 'active',
      },
      include: {
        variants: {
          include: {
            images: {
              select: {
                url: true,
              },
            },
          },
        },
      },
    });
  }

  async findOne(id: string, userId: string) {
    const product = await this.prisma.product.findFirst({
      where: {
        id,
        userId,
        isActive: true,
      },
      ...includeVariants,
    });

    if (!product) {
      this.logger.error({
        method: 'product-findOne',
        error: 'Product not found',
      });

      throw new NotFoundException('Product not found');
    }

    return product;
  }

  async update(dto: UpdateProductDto, id: string, userId: string) {
    // Catalog structure
    const categoryId = dto.categoryId;
    const subcategoryId = dto.subcategoryId;
    const catalogStructure = {
      section: {
        connect: {
          id: dto.sectionId,
        },
      },
      ...(categoryId
        ? {
            category: {
              connect: {
                id: categoryId,
              },
            },
          }
        : {
            category: {
              disconnect: {},
            },
          }),
      ...(subcategoryId
        ? {
            subcategory: {
              connect: {
                id: subcategoryId,
              },
            },
          }
        : {
            subcategory: {
              disconnect: {},
            },
          }),
    };

    // Convert composition to JSON
    const compositionJson = dto.composition.map((comp) => ({
      title: comp.title,
      percentage: comp.percentage,
    }));

    // Update
    try {
      return await this.prisma.product.update({
        where: {
          id,
          userId,
          isActive: true,
        },
        data: {
          name: dto.name,
          description: dto.description,
          brand: dto.brand,
          model: dto.model,
          gender: dto.gender || null,
          composition: compositionJson,
          store: {
            connect: {
              id: dto.storeId,
            },
          },
          ...(dto.sectionId && {
            ...catalogStructure,
          }),
        },
        ...includeVariants,
      });
    } catch (error) {
      this.logger.error({ method: 'product-update', error });

      throw new InternalServerErrorException(UNKNOWN_ERROR_TRY);
    }
  }

  async remove(id: string, userId: string) {
    try {
      await this.prisma.product.update({
        where: {
          id: id,
          userId: userId,
        },
        data: {
          isActive: false,
          variants: {
            updateMany: {
              where: {
                productId: id,
              },
              data: {
                isActive: false,
              },
            },
          },
        },
      });
    } catch (error) {
      this.logger.error({ method: 'product-remove', error });

      throw new InternalServerErrorException(UNKNOWN_ERROR_TRY);
    }
  }

  async recover(id: string, userId: string) {
    try {
      return await this.prisma.product.update({
        where: {
          id: id,
          userId: userId,
        },
        data: {
          isActive: true,
          variants: {
            updateMany: {
              where: {
                productId: id,
              },
              data: {
                isActive: true,
              },
            },
          },
        },
      });
    } catch (error) {
      this.logger.error({ method: 'product-recover', error });

      throw new InternalServerErrorException(UNKNOWN_ERROR_TRY);
    }
  }
}
