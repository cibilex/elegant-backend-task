import { Module } from '@nestjs/common';
import { RoomController } from './room.controller';
import { RoomService } from './room.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Room } from './entity/room.entity';
import { Hotel } from '../hotel/entity/hotel.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Room, Hotel])],
  controllers: [RoomController],
  providers: [RoomService],
})
export class RoomModule {}
