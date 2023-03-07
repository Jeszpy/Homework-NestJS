import { INestApplication } from '@nestjs/common';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { superUser, TestingUser } from '../../helpers/prepeared-data';
import { endpoints } from '../../helpers/routing';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../../../src/app.module';
import { createApp } from '../../../src/helpers/create-app';
import { generateRandomString, wipeAllData } from '../../helpers/general-functions';
import request from 'supertest';
import { CreateQuizQuestionDto } from '../../../src/modules/games/quiz/dto/create-quiz-question.dto';
import { isUUID } from '@nestjs/common/utils/is-uuid';
import { QuestionPublishedStatusEnum } from '../../../src/modules/games/quiz/models/quiz-question.schema';

describe('Quiz SA questions', () => {
  const second = 1000;
  const minute = 60 * second;

  jest.setTimeout(minute);

  let app: INestApplication;
  let server;
  let mongoMemoryServer: MongoMemoryServer;

  let testingUser: TestingUser;

  const url = endpoints.usersController.quiz.questions;

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

  describe(`POST => ${url} => Create question`, () => {
    it('should wipe all data', async () => {
      await wipeAllData(server);
    });
    it('should return 401 status code for unauthorized SA', async () => {
      const responseWithoutAuth = await request(server).post(url).send({});

      expect(responseWithoutAuth).toBeDefined();
      expect(responseWithoutAuth.status).toBe(401);

      const responseWithBadAuth = await request(server).post(url).auth('user', 'pass').send({});

      expect(responseWithBadAuth).toBeDefined();
      expect(responseWithBadAuth.status).toBe(401);
    });

    it('should return 400 status code for bad input values', async () => {
      const errors = {
        errorsMessages: expect.arrayContaining([
          {
            message: expect.any(String),
            field: 'body',
          },
          {
            message: expect.any(String),
            field: 'correctAnswers',
          },
        ]),
      };

      const responseWithoutBody = await request(server).post(url).auth(superUser.login, superUser.password).send({});

      expect(responseWithoutBody).toBeDefined();
      expect(responseWithoutBody.status).toBe(400);
      expect(responseWithoutBody.body).toStrictEqual(errors);

      const emptyInput = {
        body: '',
        correctAnswers: '',
      };

      const responseForEmptyBody = await request(server).post(url).auth(superUser.login, superUser.password).send(emptyInput);

      expect(responseForEmptyBody).toBeDefined();
      expect(responseForEmptyBody.status).toBe(400);
      expect(responseForEmptyBody.body).toStrictEqual(errors);

      const overMaxLenLimitInput = {
        body: generateRandomString(1000),
      };

      const responseForOverMaxLenLimitBody = await request(server)
        .post(url)
        .auth(superUser.login, superUser.password)
        .send(overMaxLenLimitInput);

      expect(responseForOverMaxLenLimitBody).toBeDefined();
      expect(responseForOverMaxLenLimitBody.status).toBe(400);
      expect(responseForOverMaxLenLimitBody.body).toStrictEqual(errors);
    });

    it('should return 201 status code and crated question', async () => {
      const createQuizQuestionDto: CreateQuizQuestionDto = {
        body: generateRandomString(50),
        correctAnswers: [15, generateRandomString(25), true],
      };

      const response = await request(server).post(url).auth(superUser.login, superUser.password).send(createQuizQuestionDto);

      expect(response).toBeDefined();
      expect(response.status).toBe(201);

      const question = response.body;

      expect(question).toEqual({
        id: expect.any(String),
        body: createQuizQuestionDto.body,
        correctAnswers: createQuizQuestionDto.correctAnswers,
        published: QuestionPublishedStatusEnum.NotPublished,
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      });
      expect(isUUID(question.id)).toBeTruthy();

      expect.setState({ question });
    });

    it('(GET) should return 200 status code and crated question', async () => {
      const { question } = expect.getState();

      const response = await request(server).get(url).auth(superUser.login, superUser.password);

      expect(response).toBeDefined();
      expect(response.status).toBe(200);
      expect(response.body.items).toHaveLength(1);
      expect(response.body.items[0]).toEqual(question);
    });
  });

  describe(`GET => ${url} => Returns all questions with pagination and filtering`, () => {
    const questionsTotalCount = 500;

    it('should wipe all data', async () => {
      await wipeAllData(server);
    });
    it('should return 401 status code for unauthorized SA', async () => {
      const responseWithoutAuth = await request(server).post(url).send({});

      expect(responseWithoutAuth).toBeDefined();
      expect(responseWithoutAuth.status).toBe(401);

      const responseWithBadAuth = await request(server).post(url).auth('user', 'pass').send({});

      expect(responseWithBadAuth).toBeDefined();
      expect(responseWithBadAuth.status).toBe(401);
    });

    it('generate questions for test', async () => {
      const questions = [];
      for (let i = 0; i < questionsTotalCount; i++) {
        const createQuizQuestionDto: CreateQuizQuestionDto = {
          body: `${generateRandomString(50)}${i}`,
          correctAnswers: [15, generateRandomString(25), true, i],
        };

        const response = await request(server).post(url).auth(superUser.login, superUser.password).send(createQuizQuestionDto);
        questions.push(response.body);
      }

      expect(questions).toHaveLength(questionsTotalCount);
      expect.setState({ questions });
    });

    it('should return default pagination result', async () => {
      const { questions } = expect.getState();

      console.log(questions);
      const response = await request(server).get(url).auth(superUser.login, superUser.password);

      const sortedQuestions = questions.sort((a, b) => {
        if (a.createdAt > b.createdAt) {
          return 1;
        } else if (a.createdAt < b.createdAt) {
          return -1;
        }
        return 0;
      });

      console.log(sortedQuestions.length);
      console.log(sortedQuestions[0]);
      console.log(response.body.items[0]);

      expect(response.status).toBe(200);
      expect(response.body.pagesCount).toBe(questionsTotalCount / 10);
      expect(response.body.page).toBe(1);
      expect(response.body.pageSize).toBe(10);
      expect(response.body.totalCount).toBe(500);
      expect(response.body.items).toHaveLength(10);
      expect(response.body.items).toBe(sortedQuestions.slice(0, 10));
    });

    // it('check pagination page size', async () => {
    //   const { questions } = expect.getState();
    //
    //   const countForFirstResponse = 100;
    //   const urlWithPageSize = getUrlWithPagination(url, { pageSize: 100 });
    //   const response = await request(server).get(urlWithPageSize).auth(superUser.login, superUser.password);
    //
    //   expect(response.status).toBe(200);
    //   expect(response.body.items).toHaveLength(1);
    //   expect(response.body.items[0]).toEqual(question);
    // });
  });
});
