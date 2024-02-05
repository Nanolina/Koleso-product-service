import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { UNKNOWN_ERROR_TRY } from '../consts';
import { MyLogger } from '../logger/my-logger.service';
import { PrismaService } from '../prisma/prisma.service';
import { CloudinaryService } from './../cloudinary/cloudinary.service';
import { UpdateStoreDto } from './dto';
import { CreateStoreDto } from './dto/create-store.dto';

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
          logo: logoFromCloudinary?.url,
          logoPublicId: logoFromCloudinary?.public_id,
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
    });
  }

  async findOne(id: string, userId: string) {
    return this.prisma.store.findFirst({
      where: {
        id,
        userId,
      },
    });
  }

  async update(
    dto: UpdateStoreDto,
    id: string,
    userId: string,
    logo: Express.Multer.File,
  ) {
    // Find a store
    const storeFromDB = await this.prisma.store.findFirst({
      where: {
        id,
        userId,
      },
    });

    // Remove logo from Cloudinary
    if (storeFromDB.logo && storeFromDB.logoPublicId) {
      try {
        await this.cloudinaryService.deleteFile(storeFromDB.logoPublicId);
      } catch (error) {
        this.logger.error({ method: 'update', error });
      }
    }

    // Upload new logo to Cloudinary
    let logoFromCloudinary;
    if (logo) {
      try {
        logoFromCloudinary = await this.cloudinaryService.uploadLogo(logo);
      } catch (error) {
        this.logger.error({ method: 'update', error });
      }
    }

    // Update store
    try {
      return await this.prisma.store.update({
        where: {
          id: id,
          userId: userId,
        },
        data: {
          name: dto.name,
          description: dto.description,
          logo: logoFromCloudinary?.url || '',
          logoPublicId: logoFromCloudinary?.public_id || '',
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
    });

    // Remove logo from Cloudinary
    if (storeFromDB.logo && storeFromDB.logoPublicId) {
      try {
        await this.cloudinaryService.deleteFile(storeFromDB.logoPublicId);
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
