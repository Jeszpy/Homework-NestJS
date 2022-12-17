import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { createApp } from './helpers/create-app';

// const fn = (len: number) => {
//   const str = new Array(len + 1).join('123');
//   console.log(str.length);
//   return str;
// };

async function bootstrap() {
  let app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT');
  app = createApp(app);
  await app.listen(port, () => {
    console.log(`App successfully started at ${port} port`);
  });
}
bootstrap();
