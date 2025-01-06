import { IsEnum, IsNumber, Min } from 'class-validator';
import { RoomTypes } from '../room.interface';

export class CreateRoomDto {
  @IsEnum(RoomTypes)
  type: RoomTypes;

  @IsNumber()
  @Min(0.1)
  price: number;
}
