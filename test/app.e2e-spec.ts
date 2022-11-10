import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

describe('App OpenAPI', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    
    const config = new DocumentBuilder()
    .setTitle('Homework-API')
    .setDescription('IT-Incubator homeworks')
    .setVersion('1.0')
    // .addTag('Homework-API')
    .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document);

    await app.init();
  });

  afterAll(async () => {
    await app.close()
  })

  it('/api (GET)', async () => {
    const response = await request(app.getHttpServer()).get('/api')
      
    expect(response).toBeDefined()
    expect(response.status).toBe(200)
  });
});
