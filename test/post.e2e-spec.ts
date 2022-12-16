import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { endpoints } from './helpers/routing';
import {
  createNewBlog,
  createNewPost,
  wipeAllData,
} from './helpers/general-functions';
import { createApp } from '../src/helpers/create-app';
import { preparedPost, superUser } from './helpers/prepeared-data';

describe('Post Controller', () => {
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
    await server.close();
    await app.close();
  });

  describe('Wipe all data before tests', () => {
    it('should wipe all data in DB and return 204 status code', async () => {
      await wipeAllData(request, app);
    });
    it('/posts (GET) should return empty array', async () => {
      const response = await request(server).get(endpoints.postController);

      expect(response).toBeDefined();
      expect(response.status).toBe(200);
      expect(response.body.items).toStrictEqual([]);
    });
  });
  describe('Create one blog as prepared data', () => {
    it('create one blog for testing, addition methods: /blogs (POST)', async () => {
      const blog = await createNewBlog(request, app);
      expect.setState({ blog });
    });
  });

  describe('Create post /posts (POST)', () => {
    it('should return 401 status code (Unauthorized)', async () => {
      const response = await request(server).post(endpoints.postController);

      expect(response).toBeDefined();
      expect(response.status).toBe(401);
    });
    it('should return 204 and array of errors', async () => {
      const response = await request(server)
        .post(endpoints.postController)
        .auth(superUser.login, superUser.password, { type: 'basic' })
        .send(preparedPost.invalid);

      expect(response).toBeDefined();
      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        errorsMessages: [
          { message: expect.any(String), field: 'title' },
          { message: expect.any(String), field: 'shortDescription' },
          { message: expect.any(String), field: 'content' },
          { message: expect.any(String), field: 'blogId' },
        ],
      });
    });
    it('should create and return new post, addition methods: /posts (GET)', async () => {
      const blog = expect.getState().blog;
      const post = await createNewPost(request, app, blog);

      const getPostById = await request(server).get(
        `${endpoints.postController}/${post.id}`,
      );

      expect(getPostById).toBeDefined();
      expect(getPostById.status).toBe(200);
      expect(getPostById.body).toEqual(post);

      expect.setState({ post });
    });
  });
  describe('Get all posts /posts (GET)', () => {
    it('should return one posts', async () => {
      const firstPost = expect.getState().post;

      const getAllBlogs = await request(server).get(
        `${endpoints.postController}/`,
      );

      expect(getAllBlogs).toBeDefined();
      expect(getAllBlogs.status).toBe(200);
      expect(getAllBlogs.body.items).toEqual([firstPost]);
    });
    it('should return 5 posts, addition methods: /posts (POST)', async () => {
      const blog = expect.getState().blog;

      for (let i = 0; i < preparedPost.defaultPostsCount - 1; i++) {
        await createNewPost(request, app, blog);
      }

      const getAllPosts = await request(server).get(endpoints.postController);

      expect(getAllPosts).toBeDefined();
      expect(getAllPosts.status).toBe(200);
      expect(getAllPosts.body.items.length).toBe(5);
      expect(getAllPosts.body.items).toEqual(expect.any(Array));
    });
  });
  describe('Update one post by id /posts (PUT)', () => {
    it('should return 401 status code (Unauthorized)', async () => {
      const response = await request(server).put(
        `${endpoints.postController}/123`,
      );

      expect(response).toBeDefined();
      expect(response.status).toBe(401);
    });
    it('should return 404 status code', async () => {
      const blog = expect.getState().blog;
      const response = await request(server)
        .put(`${endpoints.postController}/-1`)
        .auth(superUser.login, superUser.password, { type: 'basic' })
        .send({ ...preparedPost.valid, blogId: blog.id });

      expect(response).toBeDefined();
      expect(response.status).toBe(404);
    });
    it('should return array of errors and 400 status code', async () => {
      const post = expect.getState().post;
      const response = await request(server)
        .put(`${endpoints.postController}/${post.id}`)
        .auth(superUser.login, superUser.password, { type: 'basic' })
        .send(preparedPost.invalid);

      expect(response).toBeDefined();
      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        errorsMessages: [
          { message: expect.any(String), field: 'title' },
          { message: expect.any(String), field: 'shortDescription' },
          { message: expect.any(String), field: 'content' },
          { message: expect.any(String), field: 'blogId' },
        ],
      });
    });
    it('should update post and return 204 status code. Use Additional methods: /posts/:id (GET)', async () => {
      const blog = expect.getState().blog;
      const post = expect.getState().post;
      const response = await request(server)
        .put(`${endpoints.postController}/${post.id}`)
        .auth(superUser.login, superUser.password, { type: 'basic' })
        .send(preparedPost.generateNewPostInputData(blog));

      expect(response).toBeDefined();
      expect(response.status).toBe(204);

      const getPostById = await request(server).get(
        `${endpoints.postController}/${post.id}`,
      );

      expect(getPostById).toBeDefined();
      expect(getPostById.status).toBe(200);
      expect(getPostById.body).not.toEqual(post);
      expect(getPostById.body).toStrictEqual({
        id: expect.any(String),
        title: preparedPost.newValid.title,
        shortDescription: preparedPost.newValid.shortDescription,
        content: preparedPost.newValid.content,
        blogId: blog.id,
        blogName: blog.name,
        createdAt: expect.any(String),
      });
    });
  });
  describe('Delete post by id and then delete all posts', () => {
    it('should return 401 status code (Unauthorized)', async () => {
      const response = await request(server).delete(
        `${endpoints.postController}/123`,
      );

      expect(response).toBeDefined();
      expect(response.status).toBe(401);
    });
    it('should return 404 status code', async () => {
      const response = await request(server)
        .delete(`${endpoints.postController}/-1`)
        .auth(superUser.login, superUser.password, { type: 'basic' });

      expect(response).toBeDefined();
      expect(response.status).toBe(404);
    });
    it('should return 204 status code. Use Additional methods: /blog/:id (GET)', async () => {
      const post = expect.getState().post;
      const response = await request(server)
        .delete(`${endpoints.postController}/${post.id}`)
        .auth(superUser.login, superUser.password, { type: 'basic' });

      expect(response).toBeDefined();
      expect(response.status).toBe(204);
      expect(response.body).toEqual({});

      const getDeletedPost = await request(server).get(
        `${endpoints.postController}/${post.id}`,
      );
      expect(getDeletedPost).toBeDefined();
      expect(getDeletedPost.status).toBe(404);
      expect(getDeletedPost.body).toEqual({});
    });
    it('should return 204 status code. Use Additional methods: /posts (GET)', async () => {
      const getAllPostsAfterDelete = await request(server).get(
        `${endpoints.postController}/`,
      );
      expect(getAllPostsAfterDelete).toBeDefined();
      expect(getAllPostsAfterDelete.status).toBe(200);
      expect(getAllPostsAfterDelete.body.items.length).toBe(4);

      const postsIds = getAllPostsAfterDelete.body.items.map((b) => b.id);
      for (const id of postsIds) {
        const response = await request(server)
          .delete(`${endpoints.postController}/${id}`)
          .auth(superUser.login, superUser.password, { type: 'basic' });

        expect(response).toBeDefined();
        expect(response.status).toBe(204);
        expect(response.body).toEqual({});
      }

      const getAllPostsBeforeDelete = await request(server).get(
        `${endpoints.postController}/`,
      );
      expect(getAllPostsBeforeDelete).toBeDefined();
      expect(getAllPostsBeforeDelete.status).toBe(200);
      expect(getAllPostsBeforeDelete.body.items.length).toBe(0);
    });
  });

  describe('Create post blogs/:blogId/posts (POST)', () => {
    it('should return 401 status code (Unauthorized)', async () => {
      const blog = expect.getState().blog;
      const url = `${endpoints.blogController}/${blog.id}/posts`;
      const response = await request(server).post(url);

      expect(response).toBeDefined();
      expect(response.status).toBe(401);
    });
    it('should return 204 and array of errors', async () => {
      const blog = expect.getState().blog;
      const url = `${endpoints.blogController}/${blog.id}/posts`;
      const response = await request(server)
        .post(url)
        .auth(superUser.login, superUser.password, { type: 'basic' })
        .send(preparedPost.invalid);

      expect(response).toBeDefined();
      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        errorsMessages: [
          { message: expect.any(String), field: 'title' },
          { message: expect.any(String), field: 'shortDescription' },
          { message: expect.any(String), field: 'content' },
        ],
      });
    });
    it('should create and return new post, addition methods: /posts (GET)', async () => {
      const blog = expect.getState().blog;
      const url = `${endpoints.blogController}/${blog.id}/posts`;
      const post = await createNewPost(request, app, blog, url);

      const getPostById = await request(server).get(
        `${endpoints.postController}/${post.id}`,
      );

      expect(getPostById).toBeDefined();
      expect(getPostById.status).toBe(200);
      expect(getPostById.body).toEqual(post);
    });
  });
  describe('Get posts on blogs/:blogId/posts (POST)', () => {
    it('should return 404 status code (NotFound)', async () => {
      const url = `${endpoints.blogController}/-1/posts`;
      const response = await request(server).get(url);

      expect(response).toBeDefined();
      expect(response.status).toBe(404);
    });
    it('should return 200 and array of posts', async () => {
      const blog = expect.getState().blog;
      const url = `${endpoints.blogController}/${blog.id}/posts`;
      const response = await request(server).get(url);

      expect(response).toBeDefined();
      expect(response.status).toBe(200);
      expect(response.body.items.length).toBe(1);
      expect(response.body.items).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            id: expect.any(String),
            title: expect.any(String),
            shortDescription: expect.any(String),
            content: expect.any(String),
            blogId: blog.id,
            blogName: blog.name,
            createdAt: expect.any(String),
          }),
        ]),
      );
    });
  });
});
