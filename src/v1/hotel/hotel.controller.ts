import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { HotelService } from './hotel.service';
import { ListHotelDto } from './dto/list-hotel.dto';
import { CreateHotelDto } from './dto/create-hotel.dto';

@ApiBearerAuth()
@Controller('hotel')
export class HotelController {
  constructor(private readonly hotelService: HotelService) {}

  @Get()
  list(@Query() query: ListHotelDto) {
    return this.hotelService.list(query.dense);
  }

  @Post()
  create(@Body() body: CreateHotelDto) {
    return this.hotelService.create(body);
  }

  @Delete(':id')
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.hotelService.delete(id);
  }
}
