import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { GlobalValidationPipe } from '../pipes/validation.pipe';
import { GlobalHttpExceptionFilter } from '../exception-filters/http.exception-filter';
import { useContainer } from 'class-validator';
import { AppModule } from '../app.module';
//TODO: как пофиксить?
// eslint-disable-next-line @typescript-eslint/no-var-requires
// const cookieParser = require('cookie-parser');
import cookieParser from 'cookie-parser';

const addSwagger = (app: INestApplication): INestApplication => {
  const config = new DocumentBuilder()
    .setTitle('Homework-API')
    .setDescription('IT-Incubator homeworks')
    .setVersion('1.0')
    // .addTag('Homework-API')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('swagger', app, document);
  return app;
};

export const createApp = (app: INestApplication): INestApplication => {
  app = addSwagger(app);
  app.setGlobalPrefix('/api');
  app.enableCors();
  app.useGlobalPipes(GlobalValidationPipe);
  app.useGlobalFilters(GlobalHttpExceptionFilter);
  app.use(cookieParser());
  useContainer(app.select(AppModule), { fallbackOnErrors: true });
  return app;
};
