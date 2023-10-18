import {Controller, Get, Body, Post, Req, Res} from '@nestjs/common';
import {ApiTags, ApiBody, ApiBearerAuth, ApiCookieAuth} from '@nestjs/swagger';
import {AccessToken, VerificationCodeUse} from '@prisma/client';
import {Request, Response} from 'express';
import {AccountService} from '@microservices/account/account.service';
import {Public} from '@microservices/account/security/authentication/public/public.decorator';
import {AccessTokenService} from '@microservices/token/access-token/access-token.service';
import {RefreshTokenService} from '@microservices/token/refresh-token/refresh-token.service';
import {verifyEmail, verifyPhone} from '@toolkit/validators/user.validator';
import {Cookies} from '@_decorator/cookie.decorator';
import {AccessingRefreshEndpoint} from '@microservices/account/security/authentication/refresh/refresh.decorator';
import {UserService} from '@microservices/account/user/user.service';

@ApiTags('Account')
@Controller('account')
export class AccountOthersController {
  constructor(
    private readonly accountService: AccountService,
    private readonly userService: UserService,
    private readonly accessTokenService: AccessTokenService,
    private readonly refreshTokenService: RefreshTokenService
  ) {}

  @Get('me')
  @ApiBearerAuth()
  async getCurrentUser(@Req() request: Request) {
    // [step 1] Parse token from http request header.
    const accessToken =
      this.accessTokenService.getTokenFromHttpRequest(request);

    // [step 2] Get UserToken record.
    const userToken = await this.accessTokenService.findFirstOrThrow({
      where: {token: accessToken},
    });

    // [step 3] Get user.
    const user = await this.userService.findUniqueOrThrow({
      where: {id: userToken.userId},
      include: {roles: true},
    });

    return this.userService.withoutPassword(user);
  }

  @Public()
  @Post('send-verification-code')
  @ApiBody({
    description: '',
    examples: {
      a: {
        summary: 'Send to email',
        value: {
          email: 'henry@inceptionpad.com',
          use: VerificationCodeUse.RESET_PASSWORD,
        },
      },
      b: {
        summary: 'Send to phone',
        value: {
          phone: '13260000789',
          use: VerificationCodeUse.LOGIN_BY_PHONE,
        },
      },
    },
  })
  async sendVerificationCode(
    @Body() body: {email?: string; phone?: string; use: VerificationCodeUse}
  ): Promise<boolean> {
    if (body.email && verifyEmail(body.email)) {
      return await this.accountService.sendVerificationCode({
        email: body.email,
        use: body.use,
      });
    } else if (body.phone && verifyPhone(body.phone)) {
      return await this.accountService.sendVerificationCode({
        phone: body.phone,
        use: body.use,
      });
    } else {
      return false;
    }
  }

  @AccessingRefreshEndpoint()
  @Get('refresh')
  @ApiCookieAuth()
  async refresh(
    @Cookies('refreshToken') refreshToken: string,
    @Res({passthrough: true}) response: Response
  ): Promise<AccessToken> {
    // [step 1] Validate refresh token
    const userData = this.refreshTokenService.decodeToken(refreshToken) as {
      userId: string;
      sub: string;
      exp: number;
    };

    // [step 2] Invalidate existing tokens
    await this.accountService.invalidateTokens(userData.userId);

    // [step 3] Generate new tokens
    const {accessToken, refreshToken: newRefreshToken} =
      await this.accountService.generateTokens(userData.userId, userData.sub, {
        refreshTokenExpiryUnix: userData.exp,
      });

    // [step 4] Send refresh token to cookie.
    const {name, token, cookieConfig} = newRefreshToken;
    response.cookie(name, token, cookieConfig);

    // [step 5] Send access token as response.
    return accessToken;
  }

  /* End */
}
