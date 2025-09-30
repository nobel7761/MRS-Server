import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser'; // ✅ default import
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.enableCors({
    origin: ['http://localhost:3000', 'https://nicaa.vercel.app'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'Accept',
      'X-Requested-With',
    ],
    optionsSuccessStatus: 200,
  });

  app.use(cookieParser()); // ✅ works now

  app.useGlobalPipes(new ValidationPipe());
  app.setGlobalPrefix('api');

  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/',
  });

  await app.listen(process.env.PORT || 3333);
}

void bootstrap().catch((error) => {
  console.error('Failed to start application:', error);
  process.exit(1);
});
