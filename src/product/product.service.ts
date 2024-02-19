import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
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
          id: parseFloat(dto.sectionId),
        },
      },
      ...(categoryId && {
        category: {
          connect: {
            id: parseFloat(categoryId),
          },
        },
      }),
      ...(subcategoryId && {
        subcategory: {
          connect: {
            id: parseFloat(subcategoryId),
          },
        },
      }),
    };

    // Composition
    let composition;
    const compositionDTO = dto.composition;
    if (compositionDTO) {
      try {
        composition = JSON.parse(compositionDTO);
      } catch (error) {
        this.logger.error({
          method: 'create_try_catch_composition',
          error,
        });
      }
    }

    // Parameters
    let parameters;
    const parametersDTO = dto.parameters;
    if (parametersDTO) {
      try {
        parameters = JSON.parse(parametersDTO);
      } catch (error) {
        this.logger.error({
          method: 'create_try_catch_parameters',
          error,
        });
      }
    }

    if (!parameters) {
      this.logger.error({
        method: 'create',
        error: { parameters: parametersDTO },
      });

      throw new BadRequestException('Please add the quantity of items');
    }

    // Create
    try {
      parameters.forEach(async (parameter: IParameter) => {
        await this.prisma.product.create({
          data: {
            userId,
            composition,
            name: dto.name,
            description: dto.description,
            brand: dto.brand,
            model: dto.model,
            articleSupplier: dto.articleSupplier,
            priceWithoutDiscount: parseFloat(dto.priceWithoutDiscount),
            finalPrice: parseFloat(dto.finalPrice),
            gender: dto.gender,
            image: '',
            imagePublicId: '',
            articleKoleso: '',
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

  async findOne(id: string, userId: string) {
    return this.prisma.product.findFirst({
      where: {
        id,
        userId,
      },
    });
  }
}
