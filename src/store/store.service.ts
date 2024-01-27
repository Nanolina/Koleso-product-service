import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { UNKNOWN_ERROR_TRY } from '../consts';
import { MyLogger } from '../logger/my-logger.service';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateStoreServiceDto } from './dto';
import { CreateStoreDto } from './dto/create-store.dto';

@Injectable()
export class StoreService {
  constructor(
    private prisma: PrismaService,
    private readonly logger: MyLogger,
  ) {}

  async create(dto: CreateStoreDto, userId: string) {
    try {
      await this.prisma.store.create({
        data: {
          userId,
          name: dto.name,
          description: dto.description,
        },
      });

      this.logger.log({ method: 'create', log: 'store_created' });
    } catch (error) {
      this.logger.error({ method: 'create', error });

      throw new InternalServerErrorException(UNKNOWN_ERROR_TRY);
    }

    return await this.prisma.store.findMany({
      where: {
        userId,
      },
    });
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

  async update(dto: UpdateStoreServiceDto) {
    try {
      return await this.prisma.store.update({
        where: {
          id: dto.id,
          userId: dto.userId,
        },
        data: {
          name: dto.name,
          description: dto.description,
        },
      });
    } catch (error) {
      this.logger.error({ method: 'update', error });

      throw new InternalServerErrorException(UNKNOWN_ERROR_TRY);
    }
  }

  // async remove(id: number) {
  //   return `This action removes a #${id} store`;
  // }
}
