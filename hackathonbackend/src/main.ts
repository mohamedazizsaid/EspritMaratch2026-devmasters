import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import helmet from 'helmet';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const isProduction = process.env.NODE_ENV === 'production';

  const app = await NestFactory.create(AppModule, {
    logger: isProduction
      ? ['error', 'warn', 'log']
      : ['error', 'warn', 'log', 'debug', 'verbose'],
  });

  // Trust proxy (Render, Vercel, reverse proxies) pour un rate-limiting précis par IP client
  const expressApp = app.getHttpAdapter().getInstance();
  expressApp.set('trust proxy', 1);

  // Graceful shutdown
  app.enableShutdownHooks();

  // Security headers
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    }),
  );

  // CORS — dynamique selon l'environnement
  const allowedOrigins = [
    process.env.FRONTEND_URL,
    'http://localhost:5173',
    'http://localhost:3000',
    'http://localhost:5174',
  ].filter(Boolean) as string[];

  app.enableCors({
    origin: (origin, callback) => {
      // Autoriser les requêtes sans origin (ex: Postman, curl, mobile)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error(`CORS: origine non autorisée → ${origin}`));
    },
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type,Authorization',
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Global prefix
  app.setGlobalPrefix('api');

  // Swagger — désactivé en production
  if (!isProduction) {
    const config = new DocumentBuilder()
      .setTitle('FormaPro API')
      .setDescription('API de gestion des formations et utilisateurs')
      .setVersion('1.0')
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          name: 'JWT',
          description: 'Entrez votre token JWT',
          in: 'header',
        },
        'JWT-auth',
      )
      .addTag('auth', 'Authentification et gestion des utilisateurs')
      .addTag('health', "Santé de l'API")
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);
    logger.log(
      `Swagger docs: http://localhost:${process.env.PORT ?? 3000}/api/docs`,
    );
  }

  const port = process.env.PORT ?? 3000;
  await app.listen(port, '0.0.0.0');
  logger.log(
    `🚀 Application démarrée sur le port ${port} [${process.env.NODE_ENV ?? 'development'}]`,
  );
}
bootstrap();
