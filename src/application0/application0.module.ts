import {Module, MiddlewareConsumer} from '@nestjs/common';
import {ConfigModule} from '@nestjs/config';
import ApplicationConfiguration from '../config';

// Toolkit and microservice modules
import {HttpMiddleware} from '@toolkit/nestjs/middleware/http.middleware';
import {MicroserviceModule} from '@microservices/microservice.module';

// Application0 controllers
import {App0AccountModule} from './account/account.module';
import {App0CronModule} from './cron/cron.module';
import {App0EventSchedulingModule} from './event-scheduling/event-scheduling.module';
import {App0NotificationModule} from './notification/notification.module';
import {App0StorageModule} from './storage/storage.module';
import {App0TagModule} from './tag/tag.module';
import {App0WorkflowModule} from './workflow/workflow.module';
import {App0PeopleFinderModule} from './people-finder/people-finder.module';
import {App0GoClickModule} from './go-click/go-click.module';

@Module({
  imports: [
    ConfigModule.forRoot({load: [ApplicationConfiguration]}),
    // Microservices (Global modules)
    MicroserviceModule,
    // Application0
    App0AccountModule,
    App0CronModule,
    App0EventSchedulingModule,
    App0NotificationModule,
    App0StorageModule,
    App0TagModule,
    App0WorkflowModule,
    App0PeopleFinderModule,
    App0GoClickModule,
  ],
})
export class Application0Module {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(HttpMiddleware).forRoutes('*');
  }
}
