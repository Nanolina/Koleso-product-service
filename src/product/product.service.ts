import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { UNKNOWN_ERROR_TRY } from '../consts';
import { MyLogger } from '../logger/my-logger.service';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateProductDto,
  FindAllDto,
  FindOneDto,
  UpdateProductDto,
} from './dto';

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

  async create(dto: CreateProductDto, organizationId: string, userId: string) {
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
          organizationId,
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

  async findAll(dto: FindAllDto) {
    const { organizationId, filter } = dto;
    const { type } = filter;

    return this.prisma.product.findMany({
      where: {
        organizationId,
        isActive: type === 'active',
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

  async findOne(dto: FindOneDto) {
    const { id, organizationId, filterVariants } = dto;
    const { type } = filterVariants;

    const product = await this.prisma.product.findFirst({
      where: {
        id,
        organizationId,
        isActive: true,
      },
      include: {
        variants: {
          where: {
            isActive: type === 'active',
          },
        },
      },
    });

    if (!product) {
      throw new NotFoundException(
        'Product not found. If it has been deleted, restore it',
      );
    }

    return product;
  }

  async update(
    dto: UpdateProductDto,
    id: string,
    organizationId: string,
    userId: string,
  ) {
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
          organizationId,
          isActive: true,
        },
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

  async remove(id: string, organizationId: string, userId: string) {
    try {
      await this.prisma.product.update({
        where: {
          id,
          organizationId,
        },
        data: {
          userId,
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

  async recover(id: string, organizationId: string) {
    try {
      return await this.prisma.product.update({
        where: {
          id,
          organizationId,
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
