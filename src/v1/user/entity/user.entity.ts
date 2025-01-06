import { BaseEntity } from 'src/entity/base.entity';
import { Column, Entity, Index } from 'typeorm';
import { Exclude } from 'class-transformer';
import { UserTypes } from '../user.interface';

@Entity('users')
export class User extends BaseEntity {
  @Index({
    unique: true,
  })
  @Column({
    type: 'varchar',
    length: 70,
  })
  email: string;

  @Column({
    type: 'enum',
    enum: UserTypes,
    default: UserTypes.USER,
  })
  type: UserTypes;

  @Exclude()
  @Column({
    type: 'varchar',
    length: 120,
    select: false,
  })
  password: string;

  @Column({ nullable: true, name: 'verified_at' })
  verifiedAt: number;
}
