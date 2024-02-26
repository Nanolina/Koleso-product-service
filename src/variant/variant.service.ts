import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { UNKNOWN_ERROR_TRY } from '../consts';
import { MyLogger } from '../logger/my-logger.service';
import { PrismaService } from '../prisma/prisma.service';
import { VariantDto } from './dto';

@Injectable()
export class VariantService {
  constructor(
    private prisma: PrismaService,
    private readonly logger: MyLogger,
  ) {}

  async create(variantsDto: VariantDto[], productId: string, userId: string) {
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

    variantsDto.forEach(async (variant) => {
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

        throw new InternalServerErrorException(UNKNOWN_ERROR_TRY);
      }
    });
  }
}
