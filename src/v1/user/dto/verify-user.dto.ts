import { IsString, MaxLength, MinLength } from 'class-validator';

export class VerifyUserDto {
  @IsString()
  @MinLength(10)
  @MaxLength(100)
  token: string;
}
