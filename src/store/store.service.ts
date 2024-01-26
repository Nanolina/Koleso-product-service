import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { UNKNOWN_ERROR_TRY } from '../consts';
import { MyLogger } from '../logger/my-logger.service';
import { PrismaService } from '../prisma/prisma.service';
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

  // findAll() {
  //   return `This action returns all store`;
  // }

  // findOne(id: number) {
  //   return `This action returns a #${id} store`;
  // }

  // update(id: number, updateStoreDto: UpdateStoreDto) {
  //   return `This action updates a #${id} store`;
  // }

  // remove(id: number) {
  //   return `This action removes a #${id} store`;
  // }
}
