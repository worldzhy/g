import {Injectable, NotFoundException} from '@nestjs/common';
import {UserGoogleRes} from './dto/user-google.dto';

@Injectable()
export class GoogleAuthService {
  private userId: string;
  private readonly SALT_ROUNDS = 10;
  constructor() {}
  async googleAuthRedirect(user: UserGoogleRes) {
    if (!user) return new NotFoundException('User google account not found');
    return {
      status: 'success',
      message: 'Login successfully',
      data: user,
    };
  }
}
