import { IsBoolean, IsOptional } from 'class-validator';

export class ListHotelDto {
  @IsOptional()
  @IsBoolean()
  dense: boolean = false;
}
