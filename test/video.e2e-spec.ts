import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { endpoints } from './helpers/routing';
import { wipeAllData } from './helpers/general-functions';
import { createApp } from '../src/helpers/create-app';
import { subDays } from 'date-fns';

describe('Video Controller', () => {
  let app: INestApplication;
  let server;

  const preparedData = {
    valid: {
      title: 'valid title',
      author: 'valid author',
      availableResolutions: ['P144', 'P360'],
    },
    invalid: {
      title: '',
      author: '',
      availableResolutions: ['P145'],
    },
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = await moduleFixture.createNestApplication();
    app = createApp(app);
    await app.init();
    server = app.getHttpServer();
  });

  afterAll(async () => {
    await server.close();
    await app.close();
  });

  describe('Wipe all data before tests', () => {
    it('should wipe all data in DB and return 204 status code', async () => {
      const response = await wipeAllData(request, app);

      expect(response.status).toBe(204);
      expect(response.body).toEqual({});
    });
    it('/videos (GET) should return empty array', async () => {
      const response = await request(server).get(endpoints.videoController);

      expect(response).toBeDefined();
      expect(response.status).toBe(200);
      expect(response.body).toStrictEqual([]);
    });
  });

  describe('Create Video /videos (POST)', () => {
    it('should return 204 and array of errors', async () => {
      const response = await request(server)
        .post(endpoints.videoController)
        .send(preparedData.invalid);

      expect(response).toBeDefined();
      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        errorsMessages: [
          { message: expect.any(String), field: 'title' },
          { message: expect.any(String), field: 'author' },
          { message: expect.any(String), field: 'availableResolutions' },
        ],
      });
    });
    it('should create and return new video', async () => {
      const response = await request(server)
        .post(endpoints.videoController)
        .send(preparedData.valid);

      expect(response).toBeDefined();
      expect(response.status).toBe(201);
      const video = response.body;
      expect(video).toEqual({
        id: expect.any(Number),
        title: preparedData.valid.title,
        author: preparedData.valid.author,
        canBeDownloaded: false,
        minAgeRestriction: null,
        createdAt: expect.any(String),
        publicationDate: expect.any(String),
        availableResolutions: preparedData.valid.availableResolutions,
      });

      const createdAt = +new Date(video.createdAt);
      const publicationDate = +new Date(
        subDays(new Date(video.publicationDate), 1),
      );
      expect(createdAt).toBe(publicationDate);
      expect.setState({ video });

      //TODO: сделать геты, апдэйты, делиты

      // const response = await request(server).get(
      //   `${endpoints.videoController}/${video.id}`,
      // );
      //
      // expect(response).toBeDefined();
      // expect(response.status).toBe(200);
      // expect(response.body).toEqual(video);
    });
  });
});
