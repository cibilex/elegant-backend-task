import { IsString, MaxLength, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @MinLength(4)
  @MaxLength(70)
  email: string;

  @IsString()
  @MinLength(6)
  @MaxLength(32)
  password: string;
}
