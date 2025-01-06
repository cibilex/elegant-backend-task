import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { HotelModule } from './hotel/hotel.module';

@Module({
  imports: [UserModule, HotelModule],
})
export class V1Module {}
