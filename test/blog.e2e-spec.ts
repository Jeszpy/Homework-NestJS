import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { endpoints } from './helpers/routing';
import { wipeAllData } from './helpers/general-functions';
import { createApp } from '../src/helpers/create-app';
import { isUUID } from '@nestjs/common/utils/is-uuid';
import { superUser } from './helpers/auth';

describe('Blog Controller', () => {
  let app: INestApplication;
  let server;

  const preparedData = {
    valid: {
      name: 'valid name',
      description: 'valid description',
      websiteUrl: 'https://it-incubator.io/',
    },
    newValid: {
      name: 'new valid name',
      description: 'new valid description',
      websiteUrl: 'https://it-incubator.io/new',
    },
    invalid: {
      name: '',
      description: '',
      websiteUrl: '',
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
    it('/blog (GET) should return empty array', async () => {
      const response = await request(server).get(endpoints.blogController);

      expect(response).toBeDefined();
      expect(response.status).toBe(200);
      expect(response.body).toStrictEqual([]);
    });
  });

  describe('Create blog /blog (POST)', () => {
    it('should return 401 status code (Unauthorized)', async () => {
      const response = await request(server).post(endpoints.blogController);

      expect(response).toBeDefined();
      expect(response.status).toBe(401);
    });
    it('should return 204 and array of errors', async () => {
      const response = await request(server)
        .post(endpoints.blogController)
        .auth(superUser.login, superUser.password, { type: 'basic' })
        .send(preparedData.invalid);

      expect(response).toBeDefined();
      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        errorsMessages: [
          { message: expect.any(String), field: 'name' },
          { message: expect.any(String), field: 'description' },
          { message: expect.any(String), field: 'websiteUrl' },
        ],
      });
    });
    it('should create and return new blog', async () => {
      const response = await request(server)
        .post(endpoints.blogController)
        .auth(superUser.login, superUser.password, { type: 'basic' })
        .send(preparedData.valid);

      expect(response).toBeDefined();
      expect(response.status).toBe(201);
      const blog = response.body;
      expect(blog).toEqual({
        id: expect.any(String),
        name: preparedData.valid.name,
        description: preparedData.valid.description,
        websiteUrl: preparedData.valid.websiteUrl,
      });
      expect(isUUID(blog.id)).toBeTruthy();

      const getBlogById = await request(server).get(
        `${endpoints.blogController}/${blog.id}`,
      );

      expect(getBlogById).toBeDefined();
      expect(getBlogById.status).toBe(200);
      expect(getBlogById.body).toEqual(blog);

      expect.setState({ blog });
    });
  });
  describe('Get all blog /blog (GET)', () => {
    it('should return one blog', async () => {
      const firstBlog = expect.getState().blog;

      const getAllBlogs = await request(server).get(
        `${endpoints.blogController}/`,
      );

      expect(getAllBlogs).toBeDefined();
      expect(getAllBlogs.status).toBe(200);
      expect(getAllBlogs.body).toEqual([firstBlog]);
    });
    it('should return 5 blog, addition methods: /blog (POST)', async () => {
      for (let i = 0; i < 4; i++) {
        const createBlog = await request(server)
          .post(endpoints.blogController)
          .auth(superUser.login, superUser.password, { type: 'basic' })
          .send(preparedData.valid);

        expect(createBlog).toBeDefined();
        expect(createBlog.status).toBe(201);
      }

      const getAllBlogs = await request(server).get(endpoints.blogController);

      expect(getAllBlogs).toBeDefined();
      expect(getAllBlogs.status).toBe(200);
      expect(getAllBlogs.body.length).toBe(5);
      expect(getAllBlogs.body).toEqual(expect.any(Array));
    });
  });
  describe('Update one blog by id /blog (PUT)', () => {
    it('should return 401 status code (Unauthorized)', async () => {
      const response = await request(server).put(
        `${endpoints.blogController}/123`,
      );

      expect(response).toBeDefined();
      expect(response.status).toBe(401);
    });
    it('should return 404 status code', async () => {
      const response = await request(server)
        .put(`${endpoints.blogController}/-1`)
        .auth(superUser.login, superUser.password, { type: 'basic' })
        .send(preparedData.valid);

      expect(response).toBeDefined();
      expect(response.status).toBe(404);
    });
    it('should return array of errors and 400 status code', async () => {
      const blog = expect.getState().blog;
      const response = await request(server)
        .put(`${endpoints.blogController}/${blog.id}`)
        .auth(superUser.login, superUser.password, { type: 'basic' })
        .send(preparedData.invalid);

      expect(response).toBeDefined();
      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        errorsMessages: [
          { message: expect.any(String), field: 'name' },
          { message: expect.any(String), field: 'description' },
          { message: expect.any(String), field: 'websiteUrl' },
        ],
      });
    });
    it('should update blog and return 204 status code. Use Additional methods: /blog/:id (GET)', async () => {
      const blog = expect.getState().blog;
      const response = await request(server)
        .put(`${endpoints.blogController}/${blog.id}`)
        .auth(superUser.login, superUser.password, { type: 'basic' })
        .send(preparedData.newValid);

      expect(response).toBeDefined();
      expect(response.status).toBe(204);

      const getBlogById = await request(server).get(
        `${endpoints.blogController}/${blog.id}`,
      );

      expect(getBlogById).toBeDefined();
      expect(getBlogById.status).toBe(200);
      expect(getBlogById.body).not.toEqual(blog);
      expect(getBlogById.body).toStrictEqual({
        id: expect.any(String),
        name: preparedData.newValid.name,
        description: preparedData.newValid.description,
        websiteUrl: preparedData.newValid.websiteUrl,
      });
    });
  });
  describe('Delete blog by id and then delete all blog', () => {
    it('should return 401 status code (Unauthorized)', async () => {
      const response = await request(server).delete(
        `${endpoints.blogController}/123`,
      );

      expect(response).toBeDefined();
      expect(response.status).toBe(401);
    });
    it('should return 404 status code', async () => {
      const response = await request(server)
        .delete(`${endpoints.blogController}/-1`)
        .auth(superUser.login, superUser.password, { type: 'basic' });

      expect(response).toBeDefined();
      expect(response.status).toBe(404);
    });
    it('should return 204 status code. Use Additional methods: /blog/:id (GET)', async () => {
      const blog = expect.getState().blog;
      const response = await request(server)
        .delete(`${endpoints.blogController}/${blog.id}`)
        .auth(superUser.login, superUser.password, { type: 'basic' });

      expect(response).toBeDefined();
      expect(response.status).toBe(204);
      expect(response.body).toEqual({});

      const getDeletedBlog = await request(server).get(
        `${endpoints.blogController}/${blog.id}`,
      );
      expect(getDeletedBlog).toBeDefined();
      expect(getDeletedBlog.status).toBe(404);
      expect(getDeletedBlog.body).toEqual({});
    });
    it('should return 204 status code. Use Additional methods: /blog (GET)', async () => {
      const getAllBlogsAfterDelete = await request(server).get(
        `${endpoints.blogController}/`,
      );
      expect(getAllBlogsAfterDelete).toBeDefined();
      expect(getAllBlogsAfterDelete.status).toBe(200);
      expect(getAllBlogsAfterDelete.body.length).toBe(4);

      const blogsIds = getAllBlogsAfterDelete.body.map((b) => b.id);
      for (const id of blogsIds) {
        const response = await request(server)
          .delete(`${endpoints.blogController}/${id}`)
          .auth(superUser.login, superUser.password, { type: 'basic' });

        expect(response).toBeDefined();
        expect(response.status).toBe(204);
        expect(response.body).toEqual({});
      }

      const getAllBlogsBeforeDelete = await request(server).get(
        `${endpoints.blogController}/`,
      );
      expect(getAllBlogsBeforeDelete).toBeDefined();
      expect(getAllBlogsBeforeDelete.status).toBe(200);
      expect(getAllBlogsBeforeDelete.body.length).toBe(0);
    });
  });
});
