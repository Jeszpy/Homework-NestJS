import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors()

  const config = new DocumentBuilder()
    .setTitle('Homework-API')
    .setDescription('IT-Incubator homeworks')
    .setVersion('1.0')
    // .addTag('Homework-API')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  const configService = app.get(ConfigService)
  const port = configService.get<number>('PORT')
  
  await app.listen(port, () => {
    console.log(`App successfully started at ${port} port`);
    
  });
}
bootstrap();
