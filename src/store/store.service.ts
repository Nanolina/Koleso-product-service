import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { UNKNOWN_ERROR_TRY } from '../consts';
import { MyLogger } from '../logger/my-logger.service';
import { PrismaService } from '../prisma/prisma.service';
import { CloudinaryService } from './../cloudinary/cloudinary.service';
import { UpdateStoreDto } from './dto';
import { CreateStoreDto } from './dto/create-store.dto';

const includeImage = {
  include: {
    image: true,
  },
};

@Injectable()
export class StoreService {
  constructor(
    private prisma: PrismaService,
    private cloudinaryService: CloudinaryService,
    private readonly logger: MyLogger,
  ) {}

  async create(
    dto: CreateStoreDto,
    userId: string,
    image: Express.Multer.File,
  ) {
    // Upload image
    let imageFromCloudinary;
    if (image) {
      try {
        imageFromCloudinary =
          await this.cloudinaryService.uploadStoreImage(image);
      } catch (error) {
        this.logger.error({ method: 'store-create-cloudinary', error });
      }
    }

    // Create store
    try {
      return await this.prisma.store.create({
        data: {
          userId,
          name: dto.name,
          description: dto.description,
          ...(image && {
            image: {
              create: {
                url: imageFromCloudinary?.url,
                publicId: imageFromCloudinary?.public_id,
              },
            },
          }),
        },
      });
    } catch (error) {
      this.logger.error({ method: 'store-create', error });

      throw new InternalServerErrorException(UNKNOWN_ERROR_TRY);
    }
  }

  async findAll(userId: string, filter: string = 'active') {
    return this.prisma.store.findMany({
      where: {
        userId,
        isActive: filter === 'active',
      },
      ...includeImage,
    });
  }

  async findOne(id: string, userId: string) {
    const store = await this.prisma.store.findFirst({
      where: {
        id,
        userId,
        isActive: true,
      },
      ...includeImage,
    });

    if (!store) {
      this.logger.error({
        method: 'store-findOne',
        error: 'Store not found',
      });

      throw new NotFoundException('Store not found');
    }

    return store;
  }

  async update(
    dto: UpdateStoreDto,
    id: string,
    userId: string,
    image: Express.Multer.File,
  ) {
    // Find store in DB
    const oldStore = await this.prisma.store.findFirst({
      where: {
        id,
        userId,
        isActive: true,
      },
      ...includeImage,
    });

    if (!oldStore) {
      this.logger.error({
        method: 'store-update',
        error: 'Store not found',
      });

      throw new NotFoundException('Store not found, please try again');
    }

    // Remove the old image from Cloudinary if the image changes
    if (oldStore.image && (image || dto.isRemoveImage)) {
      try {
        await this.cloudinaryService.deleteFile(oldStore.image.publicId);
      } catch (error) {
        this.logger.error({
          method: 'store-update-cloudinary-deleteFile',
          error,
        });
      }
    }

    let imageFromCloudinary;
    // Upload the new image to Cloudinary if provided
    if (image) {
      try {
        imageFromCloudinary =
          await this.cloudinaryService.uploadStoreImage(image);
      } catch (error) {
        this.logger.error({
          method: 'store-update-cloudinary-uploadStoreImage',
          error,
        });
        throw new InternalServerErrorException(UNKNOWN_ERROR_TRY);
      }
    }

    // Update the store
    try {
      return await this.prisma.store.update({
        where: {
          id: id,
        },
        data: {
          name: dto.name,
          description: dto.description,
          image: image
            ? {
                upsert: {
                  create: {
                    url: imageFromCloudinary.url,
                    publicId: imageFromCloudinary.public_id,
                  },
                  update: {
                    url: imageFromCloudinary.url,
                    publicId: imageFromCloudinary.public_id,
                  },
                },
              }
            : dto.isRemoveImage
              ? {
                  delete: true,
                }
              : {},
        },
      });
    } catch (error) {
      this.logger.error({ method: 'store-update', error });
      throw new InternalServerErrorException(UNKNOWN_ERROR_TRY);
    }
  }

  async remove(id: string, userId: string) {
    try {
      return await this.prisma.store.update({
        where: {
          id: id,
          userId: userId,
        },
        data: {
          isActive: false,
        },
      });
    } catch (error) {
      this.logger.error({ method: 'store-remove', error });

      throw new InternalServerErrorException(UNKNOWN_ERROR_TRY);
    }
  }

  async recover(id: string, userId: string) {
    try {
      return await this.prisma.store.update({
        where: {
          id: id,
          userId: userId,
        },
        data: {
          isActive: true,
        },
        ...includeImage,
      });
    } catch (error) {
      this.logger.error({ method: 'store-recover', error });

      throw new InternalServerErrorException(UNKNOWN_ERROR_TRY);
    }
  }
}
