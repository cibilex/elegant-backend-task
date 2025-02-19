import { Global, Module } from '@nestjs/common';
import { RedisService } from './redis.service';
import { RedisSetService } from './redis-sets.service';
import { RedisListService } from './redis-lists.service';
import { RedisHashService } from './redis-hashes.service';
import { RedisInitService } from './redis-init.service';
import { RedisStringService } from './redis-strings.service';

@Global()
@Module({
  providers: [
    RedisInitService,
    RedisStringService,
    RedisSetService,
    RedisListService,
    RedisHashService,
    RedisListService,
    RedisService,
  ],
  exports: [RedisService],
})
export class RedisModule {}
