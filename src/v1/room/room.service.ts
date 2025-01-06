import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Not, Repository } from 'typeorm';
import { CommonTableStatuses } from 'src/typings/common';
import { GlobalException } from 'src/global/global.filter';
import { convertPrice, Response } from 'src/helpers/utils';
import { Room } from './entity/room.entity';
import { Hotel } from '../hotel/entity/hotel.entity';
import { CreateRoomDto } from './dto/create-room.dto';

@Injectable()
export class RoomService {
  constructor(
    @InjectRepository(Room)
    private readonly roomRepository: Repository<Room>,
    @InjectRepository(Hotel)
    private readonly hotelRepository: Repository<Hotel>,
  ) {}

  async list(id?: number) {
    const where: FindOptionsWhere<Room> = {
      status: Not(CommonTableStatuses.DELETED),
      hotel: {
        status: Not(CommonTableStatuses.DELETED),
      },
    };
    if (id) {
      where.id = id;
    }

    return this.roomRepository.find({
      where,
      order: {
        createdAt: 'DESC',
      },
      relations: {
        hotel: true,
      },
      select: {
        id: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        price: true,
        type: true,
        hotel: {
          id: true,
          title: true,
          country: true,
        },
      },
    });
  }

  async create(hotelId: number, { price, type }: CreateRoomDto) {
    await this.checkHotel(hotelId);

    const res = await this.roomRepository.save(
      this.roomRepository.create({
        hotelId,
        price: convertPrice(price),
        type,
      }),
    );
    const inventories = await this.list(res.id);

    return new Response(inventories[0], 'success.created', {
      property: 'words.room',
    });
  }

  async update(hotelId: number, id: number, price: number) {
    await this.checkHotel(hotelId);

    const result = await this.roomRepository.update(
      { hotelId, id, status: Not(CommonTableStatuses.DELETED) },
      this.roomRepository.create({
        price: convertPrice(price),
      }),
    );

    if (!result.affected) {
      throw new GlobalException('errors.not_found', {
        args: {
          property: 'words.room',
        },
      });
    }

    return new Response(true, 'success.updated', {
      property: 'words.room',
    });
  }

  async delete(hotelId: number, id: number) {
    await this.checkHotel(hotelId);

    const result = await this.roomRepository.update(
      { hotelId, id, status: Not(CommonTableStatuses.DELETED) },
      this.roomRepository.create({
        status: CommonTableStatuses.DELETED,
      }),
    );
    if (!result.affected) {
      throw new GlobalException('errors.not_found', {
        args: {
          property: 'words.room',
        },
      });
    }

    return new Response(true, 'success.deleted', {
      property: 'words.room',
    });
  }

  private async checkHotel(id: number) {
    const exists = await this.hotelRepository.existsBy({
      id,
      status: Not(CommonTableStatuses.DELETED),
    });

    if (!exists) {
      throw new GlobalException('errors.not_found', {
        args: {
          property: 'words.hotel',
        },
      });
    }
  }

  private exists(where: FindOptionsWhere<Room>) {
    return this.roomRepository.existsBy({
      status: Not(CommonTableStatuses.DELETED),
      ...where,
    });
  }
}
