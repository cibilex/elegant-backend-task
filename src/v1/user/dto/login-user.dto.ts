import { PickType } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';
import { IsBoolean } from 'class-validator';

export class LoginUserDto extends PickType(CreateUserDto, [
  'email',
  'password',
]) {
  @IsBoolean()
  rememberMe: boolean;
}
