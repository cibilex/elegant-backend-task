import { BadRequestException, Injectable, OnModuleInit } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entity/user.entity';
import { FindOptionsWhere, Not, Repository, EntityManager } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { EnvType } from 'src/env/env.interface';
import { LoginUserDto } from './dto/login-user.dto';
import { Response } from 'src/helpers/utils';
import { GlobalException } from 'src/global/global.filter';
import { RedisService } from 'src/redis/redis.service';
import { CommonTableStatuses } from 'src/typings/common';
import { UserTypes } from './user.interface';
import { RedisEmailVerification, RedisKeys } from 'src/redis/redis.interface';
@Injectable()
export class UserService implements OnModuleInit {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private readonly configService: ConfigService<EnvType, true>,
    private readonly redisService: RedisService,
    private readonly entityManager: EntityManager,
  ) {}

  async list(id: number) {
    const users = await this.userRepository.find({
      where: {
        status: Not(CommonTableStatuses.DELETED),
        id: Not(id),
      },
      order: {
        createdAt: 'DESC',
      },
    });

    return new Response(users);
  }

  async register(data: CreateUserDto) {
    const { email, password } = data;
    const exists = await this.userRepository.existsBy({ email });
    if (exists) {
      throw new GlobalException('errors.already_exists', {
        args: {
          property: 'words.user',
        },
      });
    }

    const hashedPassword = await bcrypt.hash(
      password,
      this.configService.get('BCRYPT_SALT', { infer: true }),
    );

    return this.entityManager.transaction(async (trx) => {
      const user = await trx.save(
        this.userRepository.create({
          email,
          password: hashedPassword,
          status: CommonTableStatuses.PASSIVE,
        }),
      );
      await this.redisService.setEmailToken(user);

      return new Response(true, 'success.registered');
    });
  }

  async verify(token: string, currentTime: number) {
    const payload = await this.redisService.get<RedisEmailVerification>({
      key: RedisKeys.EMAIL_VERIFICATION_TOKEN,
      token,
    });
    if (!payload) {
      throw new GlobalException('errors.not_found', {
        args: {
          property: 'words.token',
        },
      });
    }

    const { userId } = payload;
    const user = await this.getUser({ id: userId });
    if (user.status === CommonTableStatuses.ACTIVE) {
      throw new GlobalException('errors.already_verified');
    }

    return await this.entityManager.transaction(async (trx) => {
      await trx.update(
        User,
        userId,
        this.userRepository.create({
          status: CommonTableStatuses.ACTIVE,
          verifiedAt: currentTime,
        }),
      );

      await this.redisService.del({
        token,
        key: RedisKeys.EMAIL_VERIFICATION_TOKEN,
      });

      return new Response(true, 'success.confirmed');
    });
  }

  async profile(id: number) {
    const user = await this.userRepository.findOne({
      where: {
        id,
        status: Not(CommonTableStatuses.DELETED),
      },
      select: ['email', 'type'],
    });

    return new Response(user);
  }

  async logout(token: string) {
    await this.redisService.delAccessToken(token);
    return new Response(true, 'success.logged_out');
  }

  async login({ email, password, rememberMe }: LoginUserDto) {
    const user = await this.getUser({ email });
    if (user.status === 2) {
      throw new GlobalException('errors.not_verified', {
        payload: {
          verified: false,
        },
      });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) throw new GlobalException('errors.passwordIsNotValid');

    const accessToken = await this.redisService.setAccessToken(
      user,
      rememberMe,
    );

    return new Response({ accessToken }, 'success.logged_in');
  }

  async getUser(where: FindOptionsWhere<User>) {
    const user = await this.userRepository.findOne({
      where: {
        ...where,
        status: Not(CommonTableStatuses.DELETED),
      },
      select: ['password', 'status', 'id', 'type', 'createdAt'],
    });
    if (!user) {
      throw new GlobalException('errors.not_found', {
        args: {
          property: 'words.user',
        },
      });
    }

    return user;
  }

  async onModuleInit() {
    const email = this.configService.get('ADMIN_EMAIL', { infer: true });
    const exists = await this.userRepository.existsBy({
      email,
    });
    if (exists) {
      console.info('Admin  exists');

      return;
    }

    const hashedPassword = await bcrypt.hash(
      this.configService.get('ADMIN_PASSWORD', { infer: true }),
      this.configService.get('BCRYPT_SALT', { infer: true }),
    );

    await this.userRepository.save(
      this.userRepository.create({
        email,
        password: hashedPassword,
        type: UserTypes.ADMIN,
      }),
    );
  }
}
