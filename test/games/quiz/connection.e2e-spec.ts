import { INestApplication } from '@nestjs/common';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { TestingUser } from '../../helpers/prepeared-data';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../../../src/app.module';
import { createApp } from '../../../src/helpers/create-app';
import { wipeAllData } from '../../helpers/general-functions';
import request from 'supertest';
import { endpoints } from '../../helpers/routing';
import { QuizGameStatusEnum } from '../../../src/modules/games/quiz/models/quiz.schema';
import { QuizGameViewModel } from '../../../src/modules/games/quiz/models/quiz.view-model';

describe('Quiz game connection endpoint', () => {
  const second = 1000;
  const minute = 60 * second;

  jest.setTimeout(minute);

  let app: INestApplication;
  let server;
  let mongoMemoryServer: MongoMemoryServer;

  let testingUser: TestingUser;

  const url = endpoints.quizGameController.connection;

  beforeAll(async () => {
    mongoMemoryServer = await MongoMemoryServer.create();
    const mongoUri = mongoMemoryServer.getUri();
    process.env['MONGO_URI'] = mongoUri;
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
    await mongoMemoryServer.stop();
  });

  it('wipe all data before tests ', async () => {
    await wipeAllData(server);
  });

  it('prepare data for tests (create and login users)', async () => {
    const [user, user1] = await testingUser.createAndLoginUsers(2);

    expect(user && user1).toBeDefined();
    expect.setState({ user, user1 });
  });

  it('should return 401 status code because user unauthorized', async () => {
    const response = await request(server).post(url).send({});

    expect(response).toBeDefined();
    expect(response.status).toBe(401);
  });

  it(`should return game for first player with status: ${QuizGameStatusEnum.PendingSecondPlayer}`, async () => {
    const { user } = expect.getState();
    const response = await request(server).post(url).auth(user.accessToken, { type: 'bearer' }).send({});

    expect(response).toBeDefined();
    expect(response.status).toBe(200);

    const game: QuizGameViewModel = response.body;
    expect(game).toEqual({
      id: expect.any(String),
      firstPlayerProgress: {
        answers: [],
        player: {
          id: user.id,
          login: user.login,
        },
        score: 0,
      },
      secondPlayerProgress: null,
      questions: [],
      status: QuizGameStatusEnum.PendingSecondPlayer,
      pairCreatedDate: expect.any(String),
      startGameDate: null,
      finishGameDate: null,
    });
  });

  it('should return 403 if current user is already participating in active pair', async () => {
    const { user } = expect.getState();
    const response = await request(server).post(url).auth(user.accessToken, { type: 'bearer' }).send({});

    expect(response).toBeDefined();
    expect(response.status).toBe(403);
  });

  it(`should return game for second player with status: ${QuizGameStatusEnum.Active}`, async () => {
    const { user, user1 } = expect.getState();
    const response = await request(server).post(url).auth(user1.accessToken, { type: 'bearer' }).send({});

    expect(response).toBeDefined();
    expect(response.status).toBe(200);

    const game: QuizGameViewModel = response.body;
    expect(game).toEqual({
      id: expect.any(String),
      firstPlayerProgress: {
        answers: [],
        player: {
          id: user.id,
          login: user.login,
        },
        score: 0,
      },
      secondPlayerProgress: {
        answers: [],
        player: {
          id: user1.id,
          login: user1.login,
        },
        score: 0,
      },
      questions: [],
      status: QuizGameStatusEnum.Active,
      pairCreatedDate: expect.any(String),
      startGameDate: expect.any(String),
      finishGameDate: null,
    });
  });
});
