import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { HotelModule } from './hotel/hotel.module';
import { RoomModule } from './room/room.module';

@Module({
  imports: [UserModule, HotelModule, RoomModule],
})
export class V1Module {}
