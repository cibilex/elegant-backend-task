import { Injectable } from '@nestjs/common';
import { RedisStringService } from './redis-strings.service';
import { EnvType } from 'src/env/env.interface';
import { ConfigService } from '@nestjs/config';
import { EntityManager, Not } from 'typeorm';
import {
  RedisAccessToken,
  RedisEmailVerification,
  RedisKeys,
} from './redis.interface';
import { CommonTableStatuses } from 'src/typings/common';
import { createToken } from 'src/helpers/utils';
import { toUnixTime } from 'src/helpers/date';
import { UserVerification } from 'src/v1/user/entity/user-verification.entity';
import { UserTypes } from 'src/v1/user/user.interface';
import { RedisInitService } from './redis-init.service';
import { User } from 'src/v1/user/entity/user.entity';
import { NodemailerService } from 'src/nodemailer/nodemailer.service';
import { NodeMailerTargets } from 'src/nodemailer/nodemailer.interface';

@Injectable()
export class RedisService {
  constructor(
    private readonly redisInitService: RedisInitService,
    private readonly redisStringService: RedisStringService,
    private readonly configService: ConfigService<EnvType, true>,
    private readonly entityManager: EntityManager,
    private readonly nodemailerService: NodemailerService,
  ) {}

  async setAccessToken(
    {
      id,
      createdAt,
      type,
    }: {
      id: number;
      createdAt: number;
      type: UserTypes;
    },
    rememberMe = false,
  ) {
    const ttl = this.configService.get(
      rememberMe
        ? 'REDIS.REDIS_ACCESS_TOKEN_REMEMBER_ME_TTL'
        : 'REDIS.REDIS_ACCESS_TOKEN_TTL',
      { infer: true },
    );

    const token = createToken(
      this.configService.get('REDIS.REDIS_ACCESS_TOKEN_SECRET', {
        infer: true,
      }),
      `${id}-${createdAt}-${toUnixTime()}`,
    );

    const userId = id;

    return this.entityManager.transaction(async (trx) => {
      await trx.save(
        trx.getRepository(UserVerification).create({
          expiredAt: Math.round(ttl + Date.now() / 1000),
          userId,
          token,
          rememberMe,
        }),
      );

      const payload: RedisAccessToken = {
        userId,
        createdAt,
        rememberMe,
        userType: type,
      };
      await this.insertToken(token, RedisKeys.ACCESS_TOKEN, payload, ttl);

      return token;
    });
  }

  async get<T>({
    key,
    token,
  }: {
    token?: string;
    key: RedisKeys;
  }): Promise<T | false> {
    const res: null | string = await this.redisStringService.get(
      token ? this.getKey(key, token) : key,
    );
    return res ? JSON.parse(res) : false;
  }

  async del({
    key,
    token,
  }: {
    token?: string;
    key: RedisKeys;
  }): Promise<boolean> {
    await this.redisInitService.del(token ? this.getKey(key, token) : key);
    return true;
  }

  async getAccessToken(token: string): Promise<RedisAccessToken | false> {
    const user = await this.redisStringService.get(
      this.getKey(RedisKeys.ACCESS_TOKEN, token),
    );
    if (user) {
      return JSON.parse(user) as RedisAccessToken;
    }

    const userToken = await this.entityManager
      .createQueryBuilder(UserVerification, 'uv')
      .leftJoinAndSelect('uv.user', 'u', 'u.status = :uStatus', {
        uStatus: CommonTableStatuses.ACTIVE,
      })
      .where('uv.token = :token', {
        token,
      })
      .andWhere('uv.status = :uvStatus', {
        uvStatus: CommonTableStatuses.ACTIVE,
      })
      .select(['uv.expiredAt', 'uv.createdAt', 'u.id', 'u.createdAt', 'u.type'])
      .getOne();
    if (!userToken || userToken.expiredAt < Date.now()) {
      return false;
    }

    const { id, createdAt, type } = userToken.user;

    await this.insertToken(
      userToken.token,
      RedisKeys.ACCESS_TOKEN,
      {
        userId: id,
        createdAt,
        userType: type,
        rememberMe: userToken.rememberMe,
      },
      Math.round(userToken.expiredAt - Date.now() / 1000),
    );

    return this.getAccessToken(token);
  }

  async delAccessToken(token: string) {
    await Promise.all([
      this.redisInitService.del(this.getKey(RedisKeys.ACCESS_TOKEN, token)),
      this.entityManager.update(
        UserVerification,
        { token, status: Not(CommonTableStatuses.ACTIVE) },
        { status: CommonTableStatuses.DELETED },
      ),
    ]);
  }

  async setEmailToken({ id, createdAt, email }: User) {
    const payload: RedisEmailVerification = {
      userId: id,
      email,
      createdAt: createdAt,
    };
    const token = createToken(
      this.configService.get('REDIS.REDIS_EMAIL_VERIFICATION_TOKEN_SECRET', {
        infer: true,
      }),
      `${id}-${email}`,
    );

    await this.insertToken(
      token,
      RedisKeys.EMAIL_VERIFICATION_TOKEN,
      payload,
      this.configService.get('REDIS.EMAIL_TOKEN_TTL', { infer: true }),
    );

    await this.nodemailerService.sendEmailNotify({
      email,
      link: `${this.configService.get('BASE_URL')}/verify/${token}`,
      target: NodeMailerTargets.EMAIL_CONFIRMATION,
    });
    return token;
  }

  private insertToken(
    token: string,
    key: RedisKeys,
    payload: any,
    ttl: number,
  ) {
    const redisKey = this.getKey(key, token);
    return this.redisStringService.set(redisKey, JSON.stringify(payload), ttl);
  }

  private getKey(prefix: RedisKeys, token: string) {
    return `${prefix}:${token}`;
  }
}
