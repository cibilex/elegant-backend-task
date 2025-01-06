import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Admin, Public } from 'src/public/public.decorator';
import { toUnixTime } from 'src/helpers/date';
import { RedisService } from 'src/redis/redis.service';
import { UserTypes } from 'src/v1/user/user.interface';
import { Request } from 'express';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly redisService: RedisService,
  ) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const req = ctx.switchToHttp().getRequest<Request>();
    req.time = toUnixTime();

    const isPublic = this.checkVisibility(ctx);

    const bearerToken = this.getBearerToken(req);
    if (!bearerToken) {
      if (isPublic) {
        return true;
      } else {
        throw new UnauthorizedException();
      }
    }

    const user = await this.redisService.getAccessToken(bearerToken);
    if (!user) {
      return false;
    }

    const isAdminPage = this.checkPermissions(ctx);
    if (isAdminPage && user.userType === UserTypes.USER) {
      throw new UnauthorizedException();
    }

    req.user = user;
    return true;
  }

  private getBearerToken(req: Request) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) return false;
    const token = authHeader.substring(7);
    if (token.length < 6) return false;
    return token;
  }

  private checkVisibility(ctx: ExecutionContext) {
    const auth = this.reflector.getAllAndOverride(Public, [
      ctx.getHandler(),
      ctx.getClass(),
    ]);

    if (auth) {
      return true;
    }
  }

  private checkPermissions(ctx: ExecutionContext) {
    const auth = this.reflector.getAllAndOverride(Admin, [
      ctx.getHandler(),
      ctx.getClass(),
    ]);

    if (auth) {
      return true;
    }
  }
}
