import {Global, Module} from '@nestjs/common';
import {ToolkitModule} from '@toolkit/toolkit.module';
import MicroservicesConfiguration from './microservices.config';
import {ConfigModule} from '@nestjs/config';
import {AccountModule} from './account/account.module';
import {NotificationModule} from './notification/notification.module';
import {GoogleAuthModule} from './google-auth/google-auth.module';

@Global()
@Module({
  imports: [
    ToolkitModule,
    ConfigModule.forRoot({load: [MicroservicesConfiguration], isGlobal: true}),
    AccountModule,
    NotificationModule,
    GoogleAuthModule,
  ],
})
export class MicroservicesModule {}
