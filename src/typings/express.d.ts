import { RedisAccessToken } from 'src/redis/redis.interface';

declare module 'express' {
  export interface Request {
    user: RedisAccessToken;
    time: number;
  }
}
