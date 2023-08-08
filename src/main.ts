import {INestApplication, ValidationPipe} from '@nestjs/common';
import {NestFactory} from '@nestjs/core';
import {ConfigService} from '@nestjs/config';
import {FastifyAdapter, NestFastifyApplication} from '@nestjs/platform-fastify';
import * as cookieParser from 'cookie-parser';
import helmet from 'helmet';
import {
  DocumentBuilder,
  SwaggerModule,
  SwaggerCustomOptions,
} from '@nestjs/swagger';
import {ApplicationModule} from '@application/application.module';

function checkEnvironment(configService: ConfigService) {
  const requiredEnvVars = ['ENVIRONMENT', 'PORT'];

  requiredEnvVars.forEach(envVar => {
    if (!configService.getOrThrow<string>(envVar)) {
      throw Error(`Undefined environment variable: ${envVar}`);
    }
  });
}

async function bootstrap() {
  // Create a nestjs application.
  let app: INestApplication;
  if (process.env.NODE_FRAMEWORK === 'fastify') {
    app = await NestFactory.create<NestFastifyApplication>(
      ApplicationModule,
      new FastifyAdapter()
    );
  } else {
    app = await NestFactory.create(ApplicationModule);
    app.use(cookieParser());
    app.use(helmet());
  }

  // Check environment variables.
  const configService = app.get<ConfigService>(ConfigService);
  checkEnvironment(configService);

  // API document is only available in development environment.
  if (
    configService.getOrThrow<string>('application.environment') ===
    'development'
  ) {
    const config = new DocumentBuilder()
      .setTitle("Here's the Newbie")
      .setDescription("It's good to see you guys 🥤")
      .setVersion('1.0')
      .addCookieAuth('refreshToken')
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, config);
    const customOptions: SwaggerCustomOptions = {
      swaggerOptions: {
        persistAuthorization: true,
        tagsSorter: 'alpha',
      },
      customSiteTitle: 'Newbie APIs',
    };
    SwaggerModule.setup('api', app, document, customOptions);
  }

  // Enable CORS
  app.enableCors();

  /**
   * By default, every path parameter and query parameter comes over the network as a string.
   * When we enable this behavior globally, the ValidationPipe will try to automatically convert a string identifier
   * to a number if we specified the id type as a number (in the method signature).
   */
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
    })
  );

  // Listen port
  const port = configService.getOrThrow<number>('application.port');
  await app.listen(port, '0.0.0.0');
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
