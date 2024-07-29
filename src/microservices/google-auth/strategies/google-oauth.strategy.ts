import {Injectable} from '@nestjs/common';
import {PassportStrategy} from '@nestjs/passport';
import {Strategy} from 'passport-google-oauth20';
import {UserGoogleDto, UserGoogleRes} from '../dto/user-google.dto';
import {ConfigService} from '@nestjs/config';

@Injectable()
export class GoogleOAuthStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private readonly configService: ConfigService) {
    const clientID = configService.getOrThrow<string>(
      'microservices.googleAuth.clientId'
    );
    const clientSecret = configService.getOrThrow<string>(
      'microservices.googleAuth.clientSecret'
    );
    const callbackURL = configService.getOrThrow<string>(
      'microservices.googleAuth.callbackURL'
    );

    super({
      clientID: clientID,
      clientSecret: clientSecret,
      callbackURL: callbackURL,
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
