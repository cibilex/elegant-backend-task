import { BaseEntity } from 'src/entity/base.entity';
import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { RoomTypes } from '../room.interface';
import { Hotel } from 'src/v1/hotel/entity/hotel.entity';

@Entity('rooms')
export class Room extends BaseEntity {
  @Index()
  @Column()
  price: number;

  @Index()
  @Column({
    nullable: false,
    type: 'enum',
    enum: RoomTypes,
    default: RoomTypes.BASIC,
  })
  type: RoomTypes;

  @Column({
    nullable: false,
    name: 'hotel_id',
  })
  hotelId: number;

  @ManyToOne(() => Hotel)
  @JoinColumn({
    name: 'hotel_id',
  })
  hotel: Partial<Hotel>;
}
