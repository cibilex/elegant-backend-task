import { IsString, MaxLength, MinLength } from 'class-validator';

export class CreateHotelDto {
  @IsString()
  @MinLength(3)
  @MaxLength(80)
  title: string;

  @IsString()
  @MinLength(2)
  @MaxLength(3)
  country: string;
}
