import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
} from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { Admin } from 'src/public/public.decorator';
import { CreateRoomDto } from './dto/create-room.dto';
import { RoomService } from './room.service';

@ApiBearerAuth()
@Controller('room')
export class RoomController {
  constructor(private readonly roomService: RoomService) {}

  @Get()
  list() {
    return this.roomService.list();
  }

  @Admin(true)
  @Post(':hotel')
  create(
    @Param('hotel', ParseIntPipe) hotelId: number,
    @Body() body: CreateRoomDto,
  ) {
    return this.roomService.create(hotelId, body);
  }

  @Admin(true)
  @Delete('/:hotel/:id')
  delete(
    @Param('hotel', ParseIntPipe) hotelId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.roomService.delete(hotelId, id);
  }

  @Admin(true)
  @Put('/:hotel/:id')
  update(
    @Param('hotel', ParseIntPipe) hotelId: number,
    @Param('id', ParseIntPipe) id: number,
    @Body() body: CreateRoomDto,
  ) {
    return this.roomService.update(hotelId, id, body.price);
  }
}
