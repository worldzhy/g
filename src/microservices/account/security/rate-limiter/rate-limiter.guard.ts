import {Injectable, ExecutionContext} from '@nestjs/common';
import {Reflector} from '@nestjs/core';
import {UserService} from '../../user.service';
import {
  LimitAccessByIpService,
  LimitLoginByIpService,
  LimitLoginByUserService,
} from './rate-limiter.service';
import {
  LIMIT_ACCESS_BY_IP,
  LIMIT_LOGIN_BY_IP,
  LIMIT_LOGIN_BY_USER,
} from './rate-limiter.decorator';

@Injectable()
export class RateLimiterGuard {
  constructor(
    private readonly limitAccessByIpService: LimitAccessByIpService,
    private readonly limitLoginByIpService: LimitLoginByIpService,
    private readonly limitLoginByUserService: LimitLoginByUserService,
    private readonly userService: UserService,
    private reflector: Reflector
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Rate limiter for accessing by counting ip visits.
    const limitAccessByIp = this.reflector.getAllAndOverride<boolean>(
      LIMIT_ACCESS_BY_IP,
      [context.getHandler(), context.getClass()]
    );
    if (limitAccessByIp) {
      const ipAddress = context.switchToHttp().getRequest()
        .socket.remoteAddress;
      const isIpAllowed =
        await this.limitAccessByIpService.isAllowed(ipAddress);

      if (isIpAllowed) {
        await this.limitAccessByIpService.increment(ipAddress);
      } else {
        return false;
      }
    }

    // Rate limiter for logging in by counting ip visits.
    const limitLoginByIp = this.reflector.getAllAndOverride<boolean>(
      LIMIT_LOGIN_BY_IP,
      [context.getHandler(), context.getClass()]
    );
    if (limitLoginByIp) {
      const ipAddress = context.switchToHttp().getRequest()
        .socket.remoteAddress;
      const isIpAllowed = await this.limitLoginByIpService.isAllowed(ipAddress);

      if (isIpAllowed) {
        await this.limitLoginByIpService.increment(ipAddress);
      } else {
        return false;
      }
    }

    // Rate limiter for logging in by counting user visits.
    const limitLoginByUser = this.reflector.getAllAndOverride<boolean>(
      LIMIT_LOGIN_BY_USER,
      [context.getHandler(), context.getClass()]
    );
    if (limitLoginByUser) {
      const {account} = context.switchToHttp().getRequest().body;
      const user = await this.userService.findByAccount(account);

      if (user) {
        const isIpAllowed = await this.limitLoginByUserService.isAllowed(
          user.id
        );

        if (isIpAllowed) {
          await this.limitLoginByUserService.increment(user.id);
        } else {
          return false;
        }
      }
    }

    return true;
  }
}
