import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { endpoints } from './helpers/routing';
import { wipeAllData } from './helpers/general-functions';
import { createApp } from '../src/helpers/create-app';
import { addDays, subDays } from 'date-fns';

describe('Video Controller', () => {
  let app: INestApplication;
  let server;

  const preparedData = {
    valid: {
      title: 'valid title',
      author: 'valid author',
      availableResolutions: ['P144', 'P360'],
      canBeDownloaded: true,
      minAgeRestriction: 18,
      publicationDate: addDays(new Date(), 5).toISOString(),
    },
    invalid: {
      title: '',
      author: '',
      availableResolutions: ['P145'],
      canBeDownloaded: null,
      minAgeRestriction: 22,
      publicationDate: null,
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
      await wipeAllData(request, app);
    });
    it('/videos (GET) should return empty array', async () => {
      const response = await request(server).get(endpoints.videoController);

      expect(response).toBeDefined();
      expect(response.status).toBe(200);
      expect(response.body).toStrictEqual([]);
    });
  });

  describe('Create video /videos (POST)', () => {
    it('should return 404 status code', async () => {
      const response = await request(server)
        .post(`${endpoints.videoController}/-1`)
        .send(preparedData.valid);

      expect(response).toBeDefined();
      expect(response.status).toBe(404);
    });
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

      const getVideoById = await request(server).get(
        `${endpoints.videoController}/${video.id}`,
      );

      expect(getVideoById).toBeDefined();
      expect(getVideoById.status).toBe(200);
      expect(getVideoById.body).toEqual(video);

      expect.setState({ video });
    });
  });
  describe('Get all videos /videos (GET)', () => {
    it('should return one video', async () => {
      const firstVideo = expect.getState().video;

      const getAllVideos = await request(server).get(
        `${endpoints.videoController}/`,
      );

      expect(getAllVideos).toBeDefined();
      expect(getAllVideos.status).toBe(200);
      expect(getAllVideos.body).toEqual([firstVideo]);
    });
    it('should return 5 videos, addition methods: /videos (POST)', async () => {
      for (let i = 0; i < 4; i++) {
        const createVideo = await request(server)
          .post(endpoints.videoController)
          .send(preparedData.valid);

        expect(createVideo).toBeDefined();
        expect(createVideo.status).toBe(201);
      }

      const getAllVideos = await request(server).get(endpoints.videoController);

      expect(getAllVideos).toBeDefined();
      expect(getAllVideos.status).toBe(200);
      expect(getAllVideos.body.length).toBe(5);
      expect(getAllVideos.body).toEqual(expect.any(Array));
    });
  });

  describe('Update one video by id /videos (POST)', () => {
    it('should return 404 status code', async () => {
      const response = await request(server)
        .put(`${endpoints.videoController}/-1`)
        .send(preparedData.valid);

      expect(response).toBeDefined();
      expect(response.status).toBe(404);
    });
    it('should return array of errors and 400 status code', async () => {
      const video = expect.getState().video;
      const response = await request(server)
        .put(`${endpoints.videoController}/${video.id}`)
        .send(preparedData.invalid);

      expect(response).toBeDefined();
      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        errorsMessages: [
          { message: expect.any(String), field: 'canBeDownloaded' },
          { message: expect.any(String), field: 'minAgeRestriction' },
          { message: expect.any(String), field: 'publicationDate' },
          { message: expect.any(String), field: 'title' },
          { message: expect.any(String), field: 'author' },
          { message: expect.any(String), field: 'availableResolutions' },
        ],
      });
    });
    it('should update video and return 204 status code. Use Additional methods: /videos/:id (GET)', async () => {
      const video = expect.getState().video;
      const response = await request(server)
        .put(`${endpoints.videoController}/${video.id}`)
        .send(preparedData.valid);

      expect(response).toBeDefined();
      expect(response.status).toBe(204);

      const getVideoById = await request(server).get(
        `${endpoints.videoController}/${video.id}`,
      );

      expect(getVideoById).toBeDefined();
      expect(getVideoById.status).toBe(200);
      expect(getVideoById.body).not.toEqual(video);
      expect(getVideoById.body).toStrictEqual({
        id: video.id,
        title: preparedData.valid.title,
        author: preparedData.valid.author,
        minAgeRestriction: preparedData.valid.minAgeRestriction,
        canBeDownloaded: preparedData.valid.canBeDownloaded,
        createdAt: expect.any(String),
        publicationDate: preparedData.valid.publicationDate,
        availableResolutions: preparedData.valid.availableResolutions,
      });
    });
  });

  describe('Delete video by id and then delete all videos', () => {
    it('should return 404 status code', async () => {
      const response = await request(server).delete(
        `${endpoints.videoController}/-1`,
      );

      expect(response).toBeDefined();
      expect(response.status).toBe(404);
    });
    it('should return 204 status code. Use Additional methods: /videos/:id (GET)', async () => {
      const video = expect.getState().video;
      const response = await request(server).delete(
        `${endpoints.videoController}/${video.id}`,
      );

      expect(response).toBeDefined();
      expect(response.status).toBe(204);
      expect(response.body).toEqual({});

      const getDeletedVideo = await request(server).get(
        `${endpoints.videoController}/${video.id}`,
      );
      expect(getDeletedVideo).toBeDefined();
      expect(getDeletedVideo.status).toBe(404);
      expect(getDeletedVideo.body).toEqual({});
    });
    it('should return 204 status code. Use Additional methods: /videos (GET)', async () => {
      const getAllVideosAfterDelete = await request(server).get(
        `${endpoints.videoController}/`,
      );
      expect(getAllVideosAfterDelete).toBeDefined();
      expect(getAllVideosAfterDelete.status).toBe(200);
      expect(getAllVideosAfterDelete.body.length).toBe(4);

      const videosId = getAllVideosAfterDelete.body.map((v) => v.id);
      for (const id of videosId) {
        const response = await request(server).delete(
          `${endpoints.videoController}/${+id}`,
        );

        expect(response).toBeDefined();
        expect(response.status).toBe(204);
        expect(response.body).toEqual({});
      }

      const getAllVideosBeforeDelete = await request(server).get(
        `${endpoints.videoController}/`,
      );
      expect(getAllVideosBeforeDelete).toBeDefined();
      expect(getAllVideosBeforeDelete.status).toBe(200);
      expect(getAllVideosBeforeDelete.body.length).toBe(0);
    });
  });
});
