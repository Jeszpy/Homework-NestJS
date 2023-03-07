import dotenv from 'dotenv';
dotenv.config();
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { createApp } from './helpers/create-app';

async function bootstrap() {
  const startInit = +new Date();
  let app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT');
  app = createApp(app);
  const finishInit = (+new Date() - startInit) / 1000;
  await app.listen(port, () => {
    console.log(`App successfully started at ${port} port.`);
    console.log(`Time to init: ${finishInit} seconds`);
  });
}

bootstrap();
