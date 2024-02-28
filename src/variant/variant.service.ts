import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { createHash } from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { UNKNOWN_ERROR_TRY } from '../consts';
import { MyLogger } from '../logger/my-logger.service';
import { PrismaService } from '../prisma/prisma.service';
import { ProductService } from '../product/product.service';
import { UpdateVariantsDto } from './dto';

@Injectable()
export class VariantService {
  constructor(
    private prisma: PrismaService,
    private readonly logger: MyLogger,
    private readonly cloudinaryService: CloudinaryService,
    private readonly productService: ProductService,
  ) {}

  createArticleKoleso(productId: string, userId: string) {
    const uuid = uuidv4();
    const dataToHash = `${uuid}-${productId}-${userId}`;
    const hash = createHash('sha256').update(dataToHash).digest('hex');
    return hash.substring(0, 10);
  }

  async update(dto: UpdateVariantsDto, productId: string, userId: string) {
    await this.productService.findOneWithoutVariants(productId, userId);

    // Get existing variants for the product
    const existingVariants = await this.prisma.variant.findMany({
      where: { productId },
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
            articleKoleso: this.createArticleKoleso(productId, userId),
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
      await this.delete(variant.id);
    }

    // Return all variants
    return this.prisma.variant.findMany({
      where: {
        productId,
      },
    });
  }

  async findAll(productId: string, userId: string) {
    await this.productService.findOneWithoutVariants(productId, userId);

    return this.prisma.variant.findMany({
      where: {
        productId,
      },
    });
  }

  async delete(id: string) {
    // Get all images associated with the variant to be deleted
    const images = await this.prisma.image.findMany({
      where: { variantId: id },
    });

    // Delete images from Cloudinary
    for (const image of images) {
      if (image.publicId) {
        try {
          await this.cloudinaryService.deleteFile(image.publicId);
        } catch (error) {
          this.logger.error({ method: 'delete-cloudinary', error });
        }
      }
    }

    // Delete the variant from the database
    try {
      await this.prisma.variant.delete({
        where: { id },
      });
    } catch (error) {
      this.logger.error({ method: 'delete', error });

      throw new InternalServerErrorException(UNKNOWN_ERROR_TRY);
    }
  }
}
