import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { RedisAccessToken } from 'src/redis/redis.interface';

export const RUser = createParamDecorator(
  (data: keyof RedisAccessToken, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<Request>();
    return data ? request.user?.[data] : request.user;
  },
);
