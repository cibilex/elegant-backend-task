import { BaseEntity } from 'src/entity/base.entity';
import { Column, Entity, Index } from 'typeorm';

@Entity('hotels')
export class Hotel extends BaseEntity {
  @Index()
  @Column({
    type: 'varchar',
    length: '80',
  })
  title: string;

  @Column({
    type: 'varchar',
    length: 3,
  })
  country: string;
}
