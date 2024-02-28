import { BadRequestException, Injectable } from '@nestjs/common';
import { ColorType } from '@prisma/client';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { MyLogger } from '../logger/my-logger.service';
import { PrismaService } from '../prisma/prisma.service';
import { ProductService } from '../product/product.service';
import { changeToColorType } from '../utils';

const getWhereProductId = (productId) => {
  return {
    where: {
      variants: {
        some: {
          variant: {
            productId,
          },
        },
      },
    },
  };
};

@Injectable()
export class ImageService {
  constructor(
    private prisma: PrismaService,
    private readonly logger: MyLogger,
    private readonly cloudinaryService: CloudinaryService,
    private readonly productService: ProductService,
  ) {}

  async findAll(productId: string, userId: string) {
    await this.productService.findOneWithoutVariants(productId, userId);

    const images = await this.prisma.image.findMany({
      ...getWhereProductId(productId),
      include: {
        variants: {
          select: {
            variant: {
              select: {
                color: true,
              },
            },
          },
        },
      },
    });

    // Structuring data by color
    // Use Set to store unique URLs
    const colorMap = new Map<ColorType, Set<string>>();
    images.forEach((image) => {
      image.variants.forEach(({ variant }) => {
        const { color } = variant;
        if (!colorMap.has(color)) {
          // Initialize with an empty Set
          colorMap.set(color, new Set());
        }
        // Add the URL to Set
        colorMap.get(color)?.add(image.url);
      });
    });

    // Convert Map to an array of objects
    const result = Array.from(colorMap, ([color, urlSet]) => ({
      color,
      // Convert Set back to an array
      files: Array.from(urlSet),
    }));
    return result;
  }

  async update(
    productId: string,
    files: Array<Express.Multer.File>,
    userId: string,
  ) {
    await this.productService.findOneWithoutVariants(productId, userId);

    const imagesByColor: { [color: string]: string[] } = {};

    for (const file of files) {
      const colorType: ColorType | null = changeToColorType(file.fieldname);
      if (!colorType) {
        throw new Error(`Invalid color: ${file.fieldname}`);
      }

      // Ensure the array exists for the color
      if (!imagesByColor[colorType]) {
        imagesByColor[colorType] = [];
      }

      // Find all variants for the product with the specified color
      const variants = await this.prisma.variant.findMany({
        where: {
          productId,
          color: colorType,
        },
      });

      if (!variants.length) {
        this.logger.error({
          method: 'update',
          error: `Variants not found for productId: ${productId} and color: ${colorType}`,
        });

        throw new BadRequestException(
          `Variants not found for productId: ${productId} and color: ${colorType}`,
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

      console.log('imageFromCloudinary', imageFromCloudinary);

      const newImage = await this.prisma.image.create({
        data: {
          url: imageFromCloudinary?.url,
          publicId: imageFromCloudinary?.public_id,
        },
      });

      // Associate the new image with each variant
      for (const variant of variants) {
        await this.prisma.variantImage.create({
          data: {
            variantId: variant.id,
            imageId: newImage.id,
          },
        });
      }

      // Add the new image URL to the array for the color
      imagesByColor[colorType].push(newImage.url);
    }

    // Convert imagesByColor object to an array of objects
    return Object.entries(imagesByColor).map(([color, images]) => {
      return { color, images };
    });
  }
}
