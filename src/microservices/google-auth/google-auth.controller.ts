import {Controller, Get, Req, UseGuards} from '@nestjs/common';
import {NoGuard} from '@/microservices/account/security/passport/public/public.decorator';
import {GoogleAuthService} from './google-auth.service';
import {GoogleGuard} from './guards/google.guard';

/**
 * local dev, to change file node_modules/oauth/lib/oauth2.js
 *var HPA = require('https-proxy-agent');
  let httpsProxyAgent = null
  // fill in your proxy agent ip and port
  httpsProxyAgent = new HPA.HttpsProxyAgent("http://127.0.0.1:54960");
  // line codes to add
  options.agent = httpsProxyAgent;
  this._executeRequest( http_library, options, post_body, callback );
 */
@Controller('')
export class GoogleAuthController {
  constructor(private readonly googleAuthService: GoogleAuthService) {}
  @UseGuards(GoogleGuard)
  @NoGuard()
  @Get('oauth2/google')
  async signinWithGoogle() {}

  @UseGuards(GoogleGuard)
  @NoGuard()
  @Get('oauth2/redirect/google')
  async googleOAuthredirect(@Req() req) {
    return this.googleAuthService.googleAuthRedirect(req.user);
  }
}
