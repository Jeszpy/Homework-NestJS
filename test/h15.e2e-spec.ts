import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { createApp } from '../src/helpers/create-app';
import request from 'supertest';
import { endpoints } from './helpers/routing';
import { TestingUser } from './helpers/prepeared-data';

describe('Homework №15', () => {
  // user (=== blogger)
  // blog
  // public api => get blogs

  const second = 1000;
  const minute = 60 * second;

  jest.setTimeout(5 * minute);

  let app: INestApplication;
  let server;

  let testingUser: TestingUser;

  let user;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = await moduleFixture.createNestApplication();
    app = createApp(app);
    await app.init();
    server = app.getHttpServer();
    testingUser = new TestingUser(server);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Wipe all data before tests', () => {
    it('should wipe all data in DB and return 204 status code', async () => {
      const url = endpoints.testingController.allData;
      const response = await request(app.getHttpServer()).delete(url);
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

  // describe('Prepare data for test', () => {
  //   it('should create one user with tokens', async () => {
  //     const user = await testingUser.createAndLoginOneUser();
  //     expect.setState({ user });
  //   });
  // });
});
