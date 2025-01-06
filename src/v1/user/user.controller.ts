import { Body, Controller, Get, Post, Req } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { Admin, Public } from 'src/public/public.decorator';
import { RUser } from './user.decorator';
import { ApiBearerAuth } from '@nestjs/swagger';
import { VerifyUserDto } from './dto/verify-user.dto';
import { Request } from 'express';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiBearerAuth()
  @Public(true)
  @Post()
  register(@Body() body: CreateUserDto) {
    return this.userService.register(body);
  }

  @ApiBearerAuth()
  @Public(true)
  @Post('verify')
  verify(@Body() body: VerifyUserDto, @Req() req: Request) {
    return this.userService.verify(body.token, req.time);
  }

  @Public(true)
  @Post('login')
  login(@Body() body: LoginUserDto) {
    return this.userService.login(body);
  }

  @ApiBearerAuth()
  @Get('profile')
  profile(@RUser('userId') id: number) {
    return this.userService.profile(id);
  }

  @ApiBearerAuth()
  @Post('logout')
  logout(@Req() req: Request) {
    return this.userService.logout(req.headers.authorization!.split(' ')[1]);
  }

  @ApiBearerAuth()
  @Admin(true)
  @Get()
  list(@RUser('userId') id: number) {
    return this.userService.list(id);
  }
}
