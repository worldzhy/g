import {
  BadRequestException,
  ExecutionContext,
  Injectable,
} from '@nestjs/common';
import {AuthGuard} from '@nestjs/passport';

@Injectable()
export class GoogleGuard extends AuthGuard('google') {
  canActivate(context: ExecutionContext) {
    return super.canActivate(context);
  }
  handleRequest(err: BadRequestException, user: any) {
    if (err)
      throw new BadRequestException('Google authorization verification failed');
    return user;
  }
}
