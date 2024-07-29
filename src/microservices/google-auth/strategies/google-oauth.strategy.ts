import {Injectable} from '@nestjs/common';
import {PassportStrategy} from '@nestjs/passport';
import {Strategy} from 'passport-google-oauth20';
import {UserGoogleDto, UserGoogleRes} from '../dto/user-google.dto';

@Injectable()
export class GoogleOAuthStrategy extends PassportStrategy(Strategy, 'google') {
  constructor() {
    super({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
      scope: ['email', 'profile'],
    });
  }
  async validate(
    accessToken: string,
    refreshToken: string,
    profile: UserGoogleDto
  ): Promise<UserGoogleRes> {
    const {emails, photos, id, displayName, provider} = profile;
    const user: UserGoogleRes = {
      id,
      email: emails[0].value,
      displayName: displayName,
      picture: photos[0].value,
      provider,
    };
    return user;
  }
}
