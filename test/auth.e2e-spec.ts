import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { createApp } from '../src/helpers/create-app';
import { wipeAllData } from './helpers/general-functions';
import request from 'supertest';
import { endpoints } from './helpers/routing';
import { superUser } from './helpers/prepeared-data';

const getRefreshTokenFromCookie = (cookie: string[]): string | null => {
  const findElement = 'refreshToken';
  for (const el of cookie) {
    if (el.substring(0, findElement.length) === findElement) {
      return el.split(';')[0].split('=')[1];
    }
  }
  return null;
};

describe('Auth Controller', () => {
  let app: INestApplication;
  let server;

  const preparedData = {
    valid: {
      login: 'hleb',
      email: 'hleb.lukashonak@yandex.ru',
      loginOrEmail: 'hleb',
      password: '123456',
      accessToken: null,
      refreshToken: null,
      newRefreshToken: null,
      userAgent: 'User-Agent',
      // publicationDate: addDays(new Date(), 5).toISOString(),
    },
    invalid: {
      login: '',
      email: '',
      loginOrEmail: '',
      password: '',
      accessToken: null,
      refreshToken: null,
      // publicationDate: null,
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

  describe('Create user for tests /users', () => {
    it('should return 401 status code (without basic auth)', async () => {
      const response = await request(server).post(endpoints.usersController);

      expect(response.status).toBe(401);
    });
    it('should return 400 status code (invalid input data)', async () => {
      const response = await request(server)
        .post(endpoints.usersController)
        .auth(superUser.login, superUser.password, { type: 'basic' })
        .send(preparedData.invalid);

      expect(response.status).toBe(400);
      expect(response.body).toStrictEqual({
        errorsMessages: [
          { message: expect.any(String), field: 'login' },
          { message: expect.any(String), field: 'email' },
          { message: expect.any(String), field: 'password' },
        ],
      });
    });

    it('should create and return new user', async () => {
      const response = await request(server)
        .post(endpoints.usersController)
        .auth(superUser.login, superUser.password, { type: 'basic' })
        .send({
          login: preparedData.valid.login,
          email: preparedData.valid.email,
          password: preparedData.valid.password,
        });

      expect(response.status).toBe(201);
      expect(response.body).toStrictEqual({
        id: expect.any(String),
        login: preparedData.valid.login,
        email: preparedData.valid.email,
        createdAt: expect.any(String),
      });
    });

    it('should return 401 status code (without basic auth)', async () => {
      const response = await request(server).get(endpoints.usersController);

      expect(response.status).toBe(401);
    });

    it('should return one user in array', async () => {
      const response = await request(server)
        .get(endpoints.usersController)
        .auth(superUser.login, superUser.password, { type: 'basic' });

      expect(response.status).toBe(200);
      expect(response.body.items).toStrictEqual([
        {
          id: expect.any(String),
          login: preparedData.valid.login,
          email: preparedData.valid.email,
          createdAt: expect.any(String),
        },
      ]);
    });
  });

  describe('Login user /auth', () => {
    it('should return 400 status code and errorsMessages', async () => {
      const response = await request(server)
        .post(endpoints.authController.login)
        .send({
          loginOrEmail: preparedData.invalid.loginOrEmail,
          password: preparedData.invalid.password,
        });

      expect(response.status).toBe(400);
      expect(response.body).toStrictEqual({
        errorsMessages: [
          { message: expect.any(String), field: 'loginOrEmail' },
          { message: expect.any(String), field: 'password' },
        ],
      });
    });

    it('should return 201 status code and access/refresh tokens', async () => {
      const response = await request(server)
        .post(endpoints.authController.login)
        .set('User-Agent', preparedData.valid.userAgent)
        .send({
          loginOrEmail: preparedData.valid.loginOrEmail,
          password: preparedData.valid.password,
        });

      expect(response.status).toBe(200);

      expect(response.body).toStrictEqual({
        accessToken: expect.any(String),
      });
      preparedData.valid.accessToken = response.body.accessToken;

      const cookie = response.get('Set-Cookie');
      expect(cookie).toBeDefined();

      const refreshToken = getRefreshTokenFromCookie(cookie);
      expect(refreshToken).toBeDefined();
      preparedData.valid.refreshToken = refreshToken;
    });
  });

  describe('Check refresh token logic /auth', () => {
    it('should return 401 status code because cookie cookie is empty', async () => {
      const response = await request(server)
        .post(endpoints.authController.refreshToken)
        .set('User-Agent', preparedData.valid.userAgent);

      expect(response.status).toBe(401);
    });

    // it('should return 200 status code and new tokens pair', async () => {
    //   const response = await request(server)
    //     .post(endpoints.authController.refreshToken)
    //     .set('User-Agent', preparedData.valid.userAgent)
    //     .set('Cookie', [`refreshToken=${preparedData.valid.refreshToken}`]);
    //
    //   expect(response.status).toBe(200);
    //
    //   const newAccessToken = response.body.accessToken;
    //   expect(newAccessToken).toBeDefined();
    //   expect(newAccessToken).not.toBe(preparedData.valid.accessToken);
    //   preparedData.valid.accessToken = newAccessToken;
    //
    //   const newRefreshToken = getRefreshTokenFromCookie(
    //     response.get('Set-Cookie'),
    //   );
    //   expect(newRefreshToken).toBeDefined();
    //   expect(newRefreshToken).not.toBe(preparedData.valid.refreshToken);
    //   preparedData.valid.refreshToken = newRefreshToken;
    // });
    //
    // it('should return 401 status code because refreshToken is old', async () => {
    //   const response = await request(server)
    //     .post(endpoints.authController.refreshToken)
    //     .set('User-Agent', preparedData.valid.userAgent)
    //     .set('Cookie', [`refreshToken=${preparedData.valid.refreshToken}`]);
    //
    //   expect(response.status).toBe(401);
    // });
  });
});
