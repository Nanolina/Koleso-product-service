import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { ColorType } from '@prisma/client';
import { createHash } from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { UNKNOWN_ERROR_TRY } from '../consts';
import { MyLogger } from '../logger/my-logger.service';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateVariantsDto } from './dto';

@Injectable()
export class VariantService {
  constructor(
    private prisma: PrismaService,
    private readonly logger: MyLogger,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  createArticleKoleso(productId: string, userId: string) {
    const uuid = uuidv4();
    const dataToHash = `${uuid}-${productId}-${userId}`;
    const hash = createHash('sha256').update(dataToHash).digest('hex');
    return hash.substring(0, 10);
  }

  async generateUniqueArticleKoleso(
    productId: string,
    userId: string,
  ): Promise<string> {
    let uniqueArticle = this.createArticleKoleso(productId, userId);
    let exists = await this.prisma.variant.findUnique({
      where: { articleKoleso: uniqueArticle },
    });

    // While there is a variant with such an articleKoleso, generate a new one
    while (exists) {
      uniqueArticle = this.createArticleKoleso(productId, userId);
      exists = await this.prisma.variant.findUnique({
        where: { articleKoleso: uniqueArticle },
      });
    }

    return uniqueArticle;
  }

  async update(dto: UpdateVariantsDto, productId: string, userId: string) {
    // Get existing variants for the product
    const existingVariants = await this.prisma.variant.findMany({
      where: {
        productId,
        isActive: true,
        product: {
          userId,
          isActive: true,
        },
      },
    });

    // Updating and creating variants
    for (const variantDto of dto.variants) {
      if (variantDto.articleKoleso) {
        // Update the existing variant
        await this.prisma.variant.update({
          where: { id: variantDto.id },
          data: {
            color: variantDto.color,
            priceWithoutDiscount: variantDto.priceWithoutDiscount,
            finalPrice: variantDto.finalPrice,
            quantity: variantDto.quantity,
            articleSupplier: variantDto.articleSupplier,
            size: variantDto.size,
          },
        });
      } else {
        // Create a new variant
        await this.prisma.variant.create({
          data: {
            productId,
            color: variantDto.color,
            priceWithoutDiscount: variantDto.priceWithoutDiscount,
            finalPrice: variantDto.finalPrice,
            quantity: variantDto.quantity,
            articleSupplier: variantDto.articleSupplier,
            size: variantDto.size,
            articleKoleso: await this.generateUniqueArticleKoleso(
              productId,
              userId,
            ),
          },
        });
      }
    }

    // Deletion of variants
    const variantIdsToUpdate = dto.variants
      .filter((v) => v.id)
      .map((v) => v.id);
    const variantsToDelete = existingVariants.filter(
      (v) => !variantIdsToUpdate.includes(v.id),
    );
    for (const variant of variantsToDelete) {
      await this.removeById(variant.id, productId, userId);
    }

    // Return all variants
    return this.prisma.variant.findMany({
      where: {
        productId,
        isActive: true,
        product: {
          userId,
          isActive: true,
        },
      },
    });
  }

  async findAllByProductIdAndColor(productId: string, color: ColorType) {
    const variants = await this.prisma.variant.findMany({
      where: { productId, color, isActive: true },
    });

    if (!variants.length) {
      this.logger.error({
        method: 'findAllByProductIdAndColor',
        error: `Variants not found for productId: ${productId} and color: ${color}`,
      });

      throw new BadRequestException(
        `Variants not found for productId: ${productId} and color: ${color}`,
      );
    }

    return variants;
  }

  async removeAll(productId: string, userId: string) {
    try {
      await this.prisma.variant.updateMany({
        where: {
          productId,
          product: {
            userId,
          },
        },
        data: {
          isActive: false,
        },
      });
    } catch (error) {
      this.logger.error({ method: 'variant-removeAll', error });

      throw new InternalServerErrorException(UNKNOWN_ERROR_TRY);
    }
  }

  async removeById(id: string, productId: string, userId: string) {
    try {
      await this.prisma.variant.update({
        where: {
          id,
          productId,
          product: {
            userId,
          },
        },
        data: {
          isActive: false,
        },
      });
    } catch (error) {
      this.logger.error({ method: 'variant-removeById', error });

      throw new InternalServerErrorException(UNKNOWN_ERROR_TRY);
    }
  }
}
