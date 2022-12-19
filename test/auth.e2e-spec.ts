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

const sleep = (seconds: number) => {
  return new Promise((resolve) => setTimeout(resolve, seconds * 1000));
};

describe('Auth Controller', () => {
  // STATE
  // firstUser, secondUser
  // refreshTokenFirstUser, newRefreshTokenFirstUser, refreshTokenSecondUser
  //
  // firstAccessTokenFirstUser ???
  const second = 1000;
  const minute = 60 * second;

  jest.setTimeout(5 * minute);

  let app: INestApplication;
  let server;

  const preparedData = {
    user: {
      valid: {
        login: 'hleb',
        email: 'hleb.lukashonak@yandex.ru',
        loginOrEmail: 'hleb',
        password: '123456',
        accessToken: null,
        refreshToken: null,
        newAccessToken: null,
        newRefreshToken: null,
        userAgent: 'User-Agent',
      },
      invalid: {
        login: '',
        email: '',
        loginOrEmail: '',
        password: '',
        accessToken: null,
        refreshToken: null,
      },
    },
    user1: {
      valid: {
        login: 'hleb1',
        email: 'hleb1.lukashonak@yandex.ru',
        loginOrEmail: 'hleb1',
        password: '1234567',
        accessToken: null,
        refreshToken: null,
        newAccessToken: null,
        newRefreshToken: null,
        userAgent: 'User-Agent',
      },
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
        .send(preparedData.user.invalid);

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
      const firstUser = await request(server)
        .post(endpoints.usersController)
        .auth(superUser.login, superUser.password, { type: 'basic' })
        .send({
          login: preparedData.user.valid.login,
          email: preparedData.user.valid.email,
          password: preparedData.user.valid.password,
        });

      expect(firstUser.status).toBe(201);
      expect(firstUser.body).toStrictEqual({
        id: expect.any(String),
        login: preparedData.user.valid.login,
        email: preparedData.user.valid.email,
        createdAt: expect.any(String),
      });

      const secondUser = await request(server)
        .post(endpoints.usersController)
        .auth(superUser.login, superUser.password, { type: 'basic' })
        .send({
          login: preparedData.user1.valid.login,
          email: preparedData.user1.valid.email,
          password: preparedData.user1.valid.password,
        });

      expect.setState({
        firstUser: firstUser.body,
        secondUser: secondUser.body,
      });
    });

    it('should return 401 status code (without basic auth)', async () => {
      const response = await request(server).get(endpoints.usersController);
      expect(response.status).toBe(401);
    });

    it('should return two users in array', async () => {
      const { firstUser, secondUser } = expect.getState();
      const response = await request(server)
        .get(endpoints.usersController)
        .auth(superUser.login, superUser.password, { type: 'basic' });

      expect(response.status).toBe(200);
      expect(response.body.items.length).toBe(2);
      expect(response.body.items).toStrictEqual(
        expect.arrayContaining([firstUser, secondUser]),
      );
    });
  });

  describe('Login user /auth', () => {
    it('should return 400 status code and errorsMessages', async () => {
      const response = await request(server)
        .post(endpoints.authController.login)
        .send({
          loginOrEmail: preparedData.user.invalid.loginOrEmail,
          password: preparedData.user.invalid.password,
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
      const firstUserResponse = await request(server)
        .post(endpoints.authController.login)
        .set('User-Agent', preparedData.user.valid.userAgent)
        .send({
          loginOrEmail: preparedData.user.valid.loginOrEmail,
          password: preparedData.user.valid.password,
        });

      expect(firstUserResponse.status).toBe(200);

      expect(firstUserResponse.body).toStrictEqual({
        accessToken: expect.any(String),
      });

      const cookieFirstUser = firstUserResponse.get('Set-Cookie');
      expect(cookieFirstUser).toBeDefined();
      const refreshTokenFirstUser = getRefreshTokenFromCookie(cookieFirstUser);
      expect(refreshTokenFirstUser).toBeDefined();
      expect(refreshTokenFirstUser).toEqual(expect.any(String));

      const secondUserResponse = await request(server)
        .post(endpoints.authController.login)
        .set('User-Agent', preparedData.user.valid.userAgent)
        .send({
          loginOrEmail: preparedData.user1.valid.loginOrEmail,
          password: preparedData.user1.valid.password,
        });

      const cookieSecondUser = secondUserResponse.get('Set-Cookie');
      const refreshTokenSecondUser =
        getRefreshTokenFromCookie(cookieSecondUser);

      expect.setState({
        // firstAccessTokenFirstUser: firstUserResponse.body.accessToken,
        // secondAccessTokenFirstUser
        refreshTokenFirstUser,
        refreshTokenSecondUser,
      });

      await sleep(1); // !!! do not remove to ensure that the next token will be different (iat in seconds)
    });
  });

  describe('Check refresh token logic /auth', () => {
    it('should return 401 status code because cookie cookie is empty', async () => {
      const response = await request(server)
        .post(endpoints.authController.refreshToken)
        .set('User-Agent', preparedData.user.valid.userAgent);
      expect(response.status).toBe(401);
    });

    it('should return 200 status code and new tokens pair', async () => {
      const { refreshTokenFirstUser } = expect.getState();
      const response = await request(server)
        .post(endpoints.authController.refreshToken)
        .set('User-Agent', preparedData.user.valid.userAgent)
        .set('Cookie', [`refreshToken=${refreshTokenFirstUser}`]);

      expect(response.status).toBe(200);

      // const newAccessToken = response.body.accessToken;
      // expect(newAccessToken).toBeDefined();
      // expect(newAccessToken).not.toBe(preparedData.user.valid.accessToken);
      // preparedData.user.valid.newAccessToken = newAccessToken;

      const newRefreshTokenFirstUser = getRefreshTokenFromCookie(
        response.get('Set-Cookie'),
      );
      expect(newRefreshTokenFirstUser).toBeDefined();
      expect(newRefreshTokenFirstUser).not.toBe(refreshTokenFirstUser);
      expect.setState({ newRefreshTokenFirstUser });
    });

    it('should return 401 status code because refreshToken is old', async () => {
      const { refreshTokenFirstUser } = expect.getState();
      const response = await request(server)
        .post(endpoints.authController.refreshToken)
        .set('User-Agent', preparedData.user.valid.userAgent)
        .set('Cookie', [`refreshToken=${refreshTokenFirstUser}`]);

      expect(response.status).toBe(401);
    });
  });

  // describe('Devices', () => {
  //   describe();
  // });
});
