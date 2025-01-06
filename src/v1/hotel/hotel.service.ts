import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  EntityManager,
  FindManyOptions,
  FindOptionsWhere,
  Not,
  Repository,
} from 'typeorm';
import { CommonTableStatuses } from 'src/typings/common';
import { GlobalException } from 'src/global/global.filter';
import { Response } from 'src/helpers/utils';
import { Hotel } from './entity/hotel.entity';
import { CreateHotelDto } from './dto/create-hotel.dto';

@Injectable()
export class HotelService {
  constructor(
    @InjectRepository(Hotel)
    private readonly hotelRepository: Repository<Hotel>,
    private readonly entityManager: EntityManager,
  ) {}

  async list(dense?: boolean) {
    const findOptions: FindManyOptions<Hotel> = {
      where: {
        status: Not(CommonTableStatuses.DELETED),
      },
      order: {
        createdAt: 'DESC',
      },
    };

    if (dense) {
      findOptions.select = {
        id: true,
        title: true,
        country: true,
      };
    }

    return this.hotelRepository.find(findOptions);
  }

  async create({ title, country }: CreateHotelDto) {
    await this.throwIfExists({ title });
    const bookstore = await this.hotelRepository.save(
      this.hotelRepository.create({
        title,
        country,
      }),
    );
    return new Response(bookstore, 'success.created', {
      property: 'words.hotel',
    });
  }

  async delete(id: number) {
    await this.entityManager.transaction(async (trx) => {
      const result = await trx.update(
        Hotel,
        { id, status: Not(CommonTableStatuses.DELETED) },
        this.hotelRepository.create({
          status: CommonTableStatuses.DELETED,
        }),
      );
      if (!result.affected) {
        throw new GlobalException('errors.not_found', {
          args: {
            property: 'words.hotel',
          },
        });
      }

      //   await trx.update(
      //     Inventory,
      //     {
      //       bookId: id,
      //       status: Not(CommonTableStatuses.DELETED),
      //     },
      //     trx.getRepository(Inventory).create({
      //       status: CommonTableStatuses.DELETED,
      //     }),
      //   );
    });

    return new Response(true, 'success.deleted', {
      property: 'words.hotel',
    });
  }

  private exists(where: FindOptionsWhere<Hotel>) {
    return this.hotelRepository.existsBy({
      status: Not(CommonTableStatuses.DELETED),
      ...where,
    });
  }

  private async throwIfExists(where: FindOptionsWhere<Hotel>) {
    const exists = await this.exists(where);
    if (exists) {
      throw new GlobalException('errors.already_exists', {
        args: {
          property: 'words.hotel',
        },
      });
    }
  }
}
