import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import * as cookieParser from 'cookie-parser';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(cookieParser());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  const origin =
    process.env.WEB_ORIGIN?.split(',').map((o) => o.trim()).filter(Boolean) ?? [
      'http://localhost:3000',
      'http://localhost:3001',
    ];
  app.enableCors({
    origin,
    credentials: true,
  });

  const port = Number(process.env.API_PORT ?? 4000);
  await app.listen(port);
  console.log(`API listening on http://localhost:${port}`);
}
bootstrap();