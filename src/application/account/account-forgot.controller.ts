import {Controller, Patch, Body, BadRequestException} from '@nestjs/common';
import {ApiTags, ApiBody} from '@nestjs/swagger';
import {User} from '@prisma/client';
import {UserService} from '@microservices/account/user/user.service';
import {Public} from '@microservices/account/authentication/public/public.decorator';
import {VerificationCodeService} from '@microservices/verification-code/verification-code.service';
import {verifyEmail, verifyPhone} from '@toolkit/validators/user.validator';

@ApiTags('Account')
@Controller('account')
export class AccountForgotController {
  constructor(
    private readonly userService: UserService,
    private readonly verificationCodeService: VerificationCodeService
  ) {}

  @Public()
  @Patch('forgot-password')
  @ApiBody({
    description: '',
    examples: {
      a: {
        summary: 'Reset password with email',
        value: {
          email: 'henry@inceptionpad.com',
          verificationCode: '283749',
          newPassword: 'abc1234!',
        },
      },
      b: {
        summary: 'Reset password with phone',
        value: {
          phone: '13260000789',
          verificationCode: '283749',
          newPassword: 'abc1234!',
        },
      },
    },
  })
  async resetPassword(
    @Body()
    body: {
      email?: string;
      phone?: string;
      verificationCode: string;
      newPassword: string;
    }
  ): Promise<User> {
    if (body.email && verifyEmail(body.email)) {
      if (
        await this.verificationCodeService.validateForEmail(
          body.verificationCode,
          body.email
        )
      ) {
        return await this.userService.update({
          where: {email: body.email.toLowerCase()},
          data: {password: body.newPassword},
          select: {id: true, name: true, email: true, phone: true},
        });
      }
    } else if (body.phone && verifyPhone(body.phone)) {
      if (
        await this.verificationCodeService.validateForPhone(
          body.verificationCode,
          body.phone
        )
      ) {
        return await this.userService.update({
          where: {phone: body.phone},
          data: {password: body.newPassword},
          select: {id: true, name: true, email: true, phone: true},
        });
      }
    }

    throw new BadRequestException(
      'The email or verification code is incorrect.'
    );
  }

  /* End */
}
