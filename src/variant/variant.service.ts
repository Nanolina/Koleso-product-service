import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { UNKNOWN_ERROR_TRY } from '../consts';
import { MyLogger } from '../logger/my-logger.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateVariantsDto } from './dto';

@Injectable()
export class VariantService {
  constructor(
    private prisma: PrismaService,
    private readonly logger: MyLogger,
  ) {}

  async create(dto: CreateVariantsDto, productId: string, userId: string) {
    const product = await this.prisma.product.findFirst({
      where: {
        userId,
        id: productId,
      },
    });

    if (!product) {
      this.logger.error({ method: 'create', error: 'product not found' });

      throw new NotFoundException('product not found');
    }

    for (const variant of dto.variants) {
      try {
        await this.prisma.variant.create({
          data: {
            productId,
            color: variant.color,
            priceWithoutDiscount: variant.priceWithoutDiscount,
            finalPrice: variant.finalPrice,
            quantity: variant.quantity,
            articleSupplier: variant.articleSupplier,
            size: variant.size,
            articleKoleso: '',
          },
        });
      } catch (error) {
        this.logger.error({ method: 'create', error });

        // if (
        //   error instanceof Prisma.PrismaClientKnownRequestError &&
        //   error.code === 'P2002'
        // ) {
        //   throw new ConflictException(
        //     `A variant with the given details already exists`,
        //   );
        // }

        throw new InternalServerErrorException(UNKNOWN_ERROR_TRY);
      }
    }
  }
}
