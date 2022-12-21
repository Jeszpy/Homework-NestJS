import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { createApp } from '../src/helpers/create-app';
import { wipeAllData } from './helpers/general-functions';
import request from 'supertest';
import { endpoints } from './helpers/routing';
import { superUser } from './helpers/prepeared-data';

describe('Comments Controller', () => {
  const second = 1000;
  const minute = 60 * second;

  jest.setTimeout(5 * minute);

  let app: INestApplication;
  let server;

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
    await app.close();
  });

  it('should wipe all data in DB and return 204 status code', async () => {
    await wipeAllData(request, app);
  });

  describe('Like comment logic', () => {
    it('prepare data (user, blog, post, comment', async () => {
      const firstUser = await request(server)
        .post(endpoints.usersController)
        .auth(superUser.login, superUser.password, { type: 'basic' })
        .send({
          login: 'firstUser',
          email: 'firstUser@test.com',
          password: 'password',
        });

      console.log(firstUser.body);
      expect(firstUser).toBeDefined();
    });
  });
});
