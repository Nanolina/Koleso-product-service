import { BadRequestException, Injectable } from '@nestjs/common';
import { ColorType } from '@prisma/client';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { MyLogger } from '../logger/my-logger.service';
import { PrismaService } from '../prisma/prisma.service';
import { ProductService } from '../product/product.service';
import { changeToColorType } from '../utils';

@Injectable()
export class ImageService {
  constructor(
    private prisma: PrismaService,
    private readonly logger: MyLogger,
    private readonly cloudinaryService: CloudinaryService,
    private readonly productService: ProductService,
  ) {}

  async findAll(
    productId: string,
    userId: string,
    isShouldVerify: boolean = true,
  ) {
    if (isShouldVerify) {
      await this.productService.findOneWithoutVariants(productId, userId);
    }

    const variants = await this.prisma.variant.findMany({
      where: {
        productId,
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
      files: Array.from(urls),
    }));

    return result;
  }

  async update(
    productId: string,
    files: Array<Express.Multer.File>,
    userId: string,
  ) {
    await this.productService.findOneWithoutVariants(productId, userId);

    for (const file of files) {
      const colorType: ColorType | null = changeToColorType(file.fieldname);
      if (!colorType) {
        throw new Error(`Invalid color: ${file.fieldname}`);
      }

      // Find variant by color and product
      const variant = await this.prisma.variant.findFirst({
        where: { productId, color: colorType },
      });

      if (!variant) {
        this.logger.error({
          method: 'update',
          error: `Variant not found for productId: ${productId} and color: ${colorType}`,
        });

        throw new BadRequestException(
          `Variant not found for productId: ${productId} and color: ${colorType}`,
        );
      }

      // Upload the image to Cloudinary
      let imageFromCloudinary;
      if (file) {
        try {
          imageFromCloudinary = await this.cloudinaryService.uploadImage(file);
        } catch (error) {
          this.logger.error({ method: 'update', error });
          // Skip this file if upload failed
          continue;
        }
      }

      await this.prisma.image.create({
        data: {
          url: imageFromCloudinary?.url,
          publicId: imageFromCloudinary?.public_id,
          variantId: variant.id,
        },
      });
    }

    return this.findAll(productId, userId, false);
  }
}
