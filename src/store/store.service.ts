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

  async create(dto: CreateStoreDto, userId: string, logo: Express.Multer.File) {
    // Upload a logo
    let logoFromCloudinary;
    if (logo) {
      try {
        logoFromCloudinary = await this.cloudinaryService.uploadLogo(logo);
      } catch (error) {
        this.logger.error({ method: 'create', error });
      }
    }

    // Create store
    try {
      return await this.prisma.store.create({
        data: {
          userId,
          name: dto.name,
          description: dto.description,
          ...(logo && {
            image: {
              create: {
                url: logoFromCloudinary?.url,
                publicId: logoFromCloudinary?.public_id,
              },
            },
          }),
        },
      });
    } catch (error) {
      this.logger.error({ method: 'create', error });

      throw new InternalServerErrorException(UNKNOWN_ERROR_TRY);
    }
  }

  async findAll(userId: string) {
    return this.prisma.store.findMany({
      where: {
        userId,
      },
      ...includeImage,
    });
  }

  async findOne(id: string, userId: string) {
    return this.prisma.store.findFirst({
      where: {
        id,
        userId,
      },
      ...includeImage,
    });
  }

  async update(
    dto: UpdateStoreDto,
    id: string,
    userId: string,
    logo: Express.Multer.File,
  ) {
    // Find store in DB
    const oldStore = await this.prisma.store.findFirst({
      where: {
        id,
        userId,
      },
      ...includeImage,
    });

    if (!oldStore) {
      throw new NotFoundException('Store not found, please try again');
    }

    // Remove the old logo from Cloudinary if the logo changes
    if (oldStore.image && (logo || dto.isRemoveLogo)) {
      try {
        await this.cloudinaryService.deleteFile(oldStore.image.publicId);
      } catch (error) {
        this.logger.error({ method: 'update', error });
      }
    }

    let logoFromCloudinary;
    // Upload the new logo to Cloudinary if provided
    if (logo) {
      try {
        logoFromCloudinary = await this.cloudinaryService.uploadLogo(logo);
      } catch (error) {
        this.logger.error({ method: 'update', error });
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
          image: logo
            ? {
                upsert: {
                  create: {
                    url: logoFromCloudinary.url,
                    publicId: logoFromCloudinary.public_id,
                  },
                  update: {
                    url: logoFromCloudinary.url,
                    publicId: logoFromCloudinary.public_id,
                  },
                },
              }
            : dto.isRemoveLogo
              ? {
                  delete: true,
                }
              : {},
        },
      });
    } catch (error) {
      this.logger.error({ method: 'update', error });
      throw new InternalServerErrorException(UNKNOWN_ERROR_TRY);
    }
  }

  async remove(id: string, userId: string) {
    // Find a store
    const storeFromDB = await this.prisma.store.findFirst({
      where: {
        id,
        userId,
      },
      ...includeImage,
    });

    if (!storeFromDB) {
      throw new NotFoundException('Store not found, please try again');
    }

    // Remove logo from Cloudinary
    if (storeFromDB.image) {
      try {
        await this.cloudinaryService.deleteFile(storeFromDB.image.publicId);
      } catch (error) {
        this.logger.error({ method: 'remove', error });
      }
    }

    // Remove store
    try {
      return await this.prisma.store.delete({
        where: {
          id: id,
          userId: userId,
        },
      });
    } catch (error) {
      this.logger.error({ method: 'remove', error });

      throw new InternalServerErrorException(UNKNOWN_ERROR_TRY);
    }
  }
}
