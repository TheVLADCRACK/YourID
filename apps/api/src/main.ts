import { NestFactory, Reflector } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import * as compression from 'compression';
import * as cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);
  const nodeEnv = configService.get('NODE_ENV', 'development');
  const port = configService.get('PORT', 4000);
  const appUrl = configService.get('APP_URL', 'http://localhost:3000');

  // Security middleware
  app.use(helmet({ crossOriginEmbedderPolicy: false, contentSecurityPolicy: nodeEnv === 'production' }));
  app.use(compression());
  app.use(cookieParser());

  // CORS
  app.enableCors({
    origin: [appUrl, 'http://localhost:3000', 'http://localhost:3001'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // Global prefix
  app.setGlobalPrefix('api/v1');

  // Global exception filter
  app.useGlobalFilters(new AllExceptionsFilter());

  // Global interceptor (wrap responses in { success, data })
  // Note: disabled for now as it breaks some clients — enable selectively per controller
  // app.useGlobalInterceptors(new TransformInterceptor());

  // Global validation pipe
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
    forbidNonWhitelisted: true,
    transformOptions: { enableImplicitConversion: true },
    stopAtFirstError: true,
  }));

  // Swagger docs (dev/staging only)
  if (nodeEnv !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('Your ID API')
      .setDescription('Your ID SaaS Platform — Digital Products Marketplace')
      .setVersion('1.0')
      .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' })
      .addTag('Auth').addTag('Users').addTag('Stores').addTag('Products')
      .addTag('Orders').addTag('Payments').addTag('Withdrawals')
      .addTag('Analytics').addTag('Marketplace').addTag('Files')
      .addTag('AI').addTag('Notifications').addTag('Reviews')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document, {
      swaggerOptions: { persistAuthorization: true, docExpansion: 'none' },
    });
    logger.log(`📚 Swagger: http://localhost:${port}/api/docs`);
  }

  await app.listen(port, '0.0.0.0');
  logger.log(`🚀 API running on port ${port} [${nodeEnv}]`);
  logger.log(`🌍 API accessible on 0.0.0.0 and CORS allowed for ${appUrl}`);
}

bootstrap();
