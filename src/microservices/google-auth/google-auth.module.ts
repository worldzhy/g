import {Module} from '@nestjs/common';
import {GoogleAuthController} from './google-auth.controller';
import {GoogleOAuthStrategy} from './strategies/google-oauth.strategy';
import {GoogleAuthService} from './google-auth.service';
import {PassportModule} from '@nestjs/passport';

@Module({
  imports: [PassportModule],
  controllers: [GoogleAuthController],
  providers: [GoogleOAuthStrategy, GoogleAuthService],
})
export class GoogleAuthModule {}
