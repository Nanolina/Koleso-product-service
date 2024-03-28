import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { createHash } from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import { UNKNOWN_ERROR_TRY } from '../consts';
import { ImageService } from '../image/image.service';
import { MyLogger } from '../logger/my-logger.service';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateVariantsDto } from './dto';

@Injectable()
export class VariantService {
  constructor(
    private prisma: PrismaService,
    private readonly logger: MyLogger,
    private readonly imageService: ImageService,
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

  async findMany(productId: string, organizationId: string) {
    return this.prisma.variant.findMany({
      where: {
        productId,
        isActive: true,
        product: {
          organizationId,
          isActive: true,
        },
      },
    });
  }

  async update(
    dto: UpdateVariantsDto,
    productId: string,
    organizationId: string,
    userId: string,
  ) {
    // Get existing variants for the product
    const existingVariants = await this.prisma.variant.findMany({
      where: {
        productId,
        isActive: true,
        product: {
          userId,
          organizationId,
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
      await this.remove(variant.id, organizationId);
    }

    await this.imageService.copyImagesForNewVariants(productId, organizationId);

    return await this.findMany(productId, organizationId);
  }

  async remove(id: string, organizationId: string) {
    try {
      await this.prisma.variant.update({
        where: {
          id,
          product: {
            organizationId,
          },
        },
        data: {
          isActive: false,
        },
      });
    } catch (error) {
      this.logger.error({ method: 'variant-remove', error });
      throw new InternalServerErrorException(UNKNOWN_ERROR_TRY);
    }
  }

  async recover(id: string, userId: string) {
    try {
      const variant = await this.prisma.variant.update({
        where: {
          id: id,
          product: {
            userId,
          },
        },
        data: {
          isActive: true,
        },
      });

      await this.imageService.copyImagesForNewVariants(
        variant.productId,
        userId,
      );

      return await this.prisma.variant.findMany({
        where: {
          productId: variant.productId,
          isActive: false,
        },
      });
    } catch (error) {
      this.logger.error({ method: 'variant-recover', error });
      throw new InternalServerErrorException(UNKNOWN_ERROR_TRY);
    }
  }
}
