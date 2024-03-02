import { Injectable } from '@nestjs/common';
import { ColorType } from '@prisma/client';
import { VariantService } from 'src/variant/variant.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { MyLogger } from '../logger/my-logger.service';
import { PrismaService } from '../prisma/prisma.service';
import { changeToColorType } from '../utils';
import { UpdateImagesForVariantsDto } from './dto';

@Injectable()
export class ImageService {
  constructor(
    private prisma: PrismaService,
    private readonly logger: MyLogger,
    private readonly cloudinaryService: CloudinaryService,
    private readonly variantService: VariantService,
  ) {}

  async findAll(productId: string, userId: string) {
    const variants = await this.prisma.variant.findMany({
      where: {
        productId,
        isActive: true,
        product: {
          userId,
        },
      },
      include: {
        images: true,
      },
    });

    const colorMap = new Map<ColorType, Set<string>>();
    variants.forEach((variant) => {
      variant.images.forEach((image) => {
        const { color } = variant;
        if (!colorMap.has(color)) {
          colorMap.set(color, new Set());
        }
        colorMap.get(color)?.add(image.url);
      });
    });

    const result = Array.from(colorMap).map(([color, urls]) => ({
      color,
      images: Array.from(urls),
    }));

    return result;
  }

  async update(
    productId: string,
    files: Array<Express.Multer.File>,
    existingImagesURL: UpdateImagesForVariantsDto,
    userId: string,
  ) {
    const existingImages = await this.prisma.image.findMany({
      where: {
        variant: {
          productId,
          isActive: true,
          product: {
            userId,
          },
        },
      },
    });

    // Determine which images should be deleted
    const imagesToDelete = existingImages.filter(({ url }) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      return !Object.entries(existingImagesURL).some(([color, images]) => {
        return images.includes(url);
      });
    });

    // Deleting images from Cloudinary and database
    for (const { id, publicId } of imagesToDelete) {
      await this.cloudinaryService.deleteFile(publicId);
      await this.prisma.image.delete({ where: { id } });
    }

    for (const file of files) {
      // Change color to ColorType
      const colorType: ColorType | null = changeToColorType(file.fieldname);

      // Find all variants for this product and color
      const variants = await this.variantService.findAllByProductIdAndColor(
        productId,
        colorType,
      );

      // Upload the image to Cloudinary
      let imageFromCloudinary;
      if (file) {
        try {
          imageFromCloudinary =
            await this.cloudinaryService.uploadProductImage(file);
          // Create new images
          for (const variant of variants) {
            await this.prisma.image.create({
              data: {
                url: imageFromCloudinary?.url,
                publicId: imageFromCloudinary?.public_id,
                variantId: variant.id,
              },
            });
          }
        } catch (error) {
          this.logger.error({ method: 'image-update', error });
          // Skip this file if upload failed
          continue;
        }
      }
    }

    return this.findAll(productId, userId);
  }
}
