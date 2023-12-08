import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import {PassportStrategy} from '@nestjs/passport';
import {Strategy} from 'passport-custom';
import {Request} from 'express';
import {verifyUuid} from '@toolkit/validators/user.validator';
import {
  IpLoginLimiterService,
  UserLoginLimiterService,
} from '@microservices/account/security/login-limiter/login-limiter.service';
import {PrismaService} from '@toolkit/prisma/prisma.service';

@Injectable()
export class AuthUuidStrategy extends PassportStrategy(
  Strategy,
  'passport-custom.uuid'
) {
  constructor(
    private readonly prisma: PrismaService,
    private readonly securityLoginIpAttemptService: IpLoginLimiterService,
    private readonly securityLoginUserAttemptService: UserLoginLimiterService
  ) {
    super();
  }

  /**
   * 'validate' function must be implemented.
   */
  async validate(req: Request): Promise<boolean> {
    const ipAddress = req.socket.remoteAddress as string;

    // [step 1] Guard statement.
    const uuid = req.body.uuid;
    if (!verifyUuid(uuid)) {
      throw new UnauthorizedException('The uuid is invaild.');
    }

    // [step 2] Validate uuid.
    const user = await this.prisma.user.findUnique({
      where: {id: uuid},
    });
    if (!user) {
      await this.securityLoginIpAttemptService.increment(ipAddress);
      throw new UnauthorizedException('The uuid is incorrect.');
    }

    // [step 3] Check if user is allowed to login.
    const isUserAllowed = await this.securityLoginUserAttemptService.isAllowed(
      user.id
    );
    if (!isUserAllowed) {
      throw new ForbiddenException('Forbidden resource');
    }

    // [step 4] OK.
    await this.securityLoginUserAttemptService.delete(user.id);
    return true;
  }
}
