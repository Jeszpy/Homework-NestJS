import { wipeAllData } from '../helpers/general-functions';
import { CommentViewModel } from '../../src/modules/comment/models/comment-view-model';
import { endpoints } from '../helpers/routing';
import request from 'supertest';
import { UpdateBlogDto } from '../../src/modules/blog/dto/update-blog.dto';
import { faker } from '@faker-js/faker';
import { CreateBlogDto } from '../../src/modules/blog/dto/create-blog.dto';
import { isUUID } from '@nestjs/common/utils/is-uuid';
import { INestApplication } from '@nestjs/common';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { TestingRepository } from '../../src/modules/testing/infrastructure/testing.repository.mongodb';
import { TestingBlog, TestingComment, TestingPost, TestingUser } from '../helpers/prepeared-data';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../../src/app.module';
import { createApp } from '../../src/helpers/create-app';

describe('Blogger endpoints', () => {
  const second = 1000;
  const minute = 60 * second;

  jest.setTimeout(5 * minute);

  let app: INestApplication;
  let server;
  let mongoMemoryServer: MongoMemoryServer;

  let testingUser: TestingUser;
  let testingBlog: TestingBlog;
  let testingPost: TestingPost;
  let testingComment: TestingComment;

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
    testingBlog = new TestingBlog(server);
    testingPost = new TestingPost(server);
    testingPost = new TestingPost(server);
    testingComment = new TestingComment(server);
  });

  afterAll(async () => {
    await app.close();
    await mongoMemoryServer.stop();
  });

  describe('GET => /blogger/blogs/comments => Returns all comments for all posts inside all current user blogs', () => {
    const countOfComments = 10;
    it('should wipe all data for describe', async () => {
      await wipeAllData(server);
    });
    it('prepare data for describe (user, blog, post, comments)', async () => {
      const user = await testingUser.createAndLoginOneUser();
      const blog = await testingBlog.createOneBlog(user.accessToken);
      const post = await testingPost.createOnePostForBlog(user.accessToken, blog);
      const comments = await testingComment.createCommentsForPost(user.accessToken, post, countOfComments);
      expect(user && blog && post && comments).toBeDefined();
      expect.setState({ user, blog, post, comments });
    });
    it('should return all comments for all posts inside all current user blogs', async () => {
      const { user, post, comments } = expect.getState();
      const firstComment: CommentViewModel = comments[0];

      const url = `${endpoints.bloggerController}/comments`;
      const response = await request(server).get(url).auth(user.accessToken, { type: 'bearer' });

      expect(response).toBeDefined();
      expect(response.body).toHaveLength(countOfComments);
      expect(response.body[0]).toEqual({
        id: firstComment.id,
        content: firstComment.content,
        commentatorInfo: {
          userId: firstComment.userId,
          userLogin: firstComment.userLogin,
        },
        createdAt: firstComment.createdAt,
        postInfo: { id: post.id, title: post.title, blogId: post.blogId, blogName: post.blogName },
      });
      for (const i in comments) {
        expect(response.body[i]).toEqual({
          id: comments[i].id,
          content: comments[i].content,
          commentatorInfo: {
            userId: comments[i].userId,
            userLogin: comments[i].userLogin,
          },
          createdAt: comments[i].createdAt,
          postInfo: { id: post.id, title: post.title, blogId: post.blogId, blogName: post.blogName },
        });
      }
    });
  });

  describe('PUT => /blogger/blogs/:id => Update existing Blog by id with InputModel', () => {
    it('should wipe all data for describe', async () => {
      await wipeAllData(server);
    });
    it('prepare data for describe (users, blog)', async () => {
      const [user, user1] = await testingUser.createAndLoginUsers(2);
      const blog = await testingBlog.createOneBlog(user.accessToken);

      expect(user && blog).toBeDefined();
      expect.setState({ user, user1, blog });
    });

    it('should return 401 status code because without auth', async () => {
      const response = await request(server).put(`${endpoints.bloggerController}/123`);
      expect(response.status).toBe(401);
    });

    it('should return 400 status code because without auth', async () => {
      const { user, blog } = expect.getState();

      const errors = {
        errorsMessages: expect.arrayContaining([
          {
            message: expect.any(String),
            field: 'name',
          },
          {
            message: expect.any(String),
            field: 'description',
          },
          {
            message: expect.any(String),
            field: 'websiteUrl',
          },
        ]),
      };

      const response = await request(server)
        .put(`${endpoints.bloggerController}/${blog.id}`)
        .auth(user.accessToken, { type: 'bearer' })
        .send({});
      expect(response.status).toBe(400);
      expect(response.body).toStrictEqual(errors);

      const emptyUpdateBlogDto: UpdateBlogDto = {
        name: '',
        description: '',
        websiteUrl: '',
      };

      const response1 = await request(server)
        .put(`${endpoints.bloggerController}/${blog.id}`)
        .auth(user.accessToken, { type: 'bearer' })
        .send(emptyUpdateBlogDto);
      expect(response1.status).toBe(400);
      expect(response1.body).toStrictEqual(errors);

      const maxLenLimitUpdateBlogDto: UpdateBlogDto = {
        name: faker.lorem.paragraphs(15),
        description: faker.lorem.paragraphs(50),
        websiteUrl: faker.lorem.paragraphs(15),
      };

      const response2 = await request(server)
        .put(`${endpoints.bloggerController}/${blog.id}`)
        .auth(user.accessToken, { type: 'bearer' })
        .send(maxLenLimitUpdateBlogDto);
      expect(response2.status).toBe(400);
      expect(response2.body).toStrictEqual(errors);
    });

    it('should return 404 status code because blog with id "-1" does not exists', async () => {
      const { user } = expect.getState();

      const updateBlogDto: UpdateBlogDto = {
        name: faker.lorem.word({ length: 10 }),
        description: faker.lorem.paragraph(3),
        websiteUrl: faker.internet.url(),
      };

      const response = await request(server)
        .put(`${endpoints.bloggerController}/-1`)
        .auth(user.accessToken, { type: 'bearer' })
        .send(updateBlogDto);
      expect(response.status).toBe(404);
    });

    it('should return 403 status code because user try to update blog that doesnt belong to current user', async () => {
      const { user1, blog } = expect.getState();

      const updateBlogDto: UpdateBlogDto = {
        name: faker.lorem.word({ length: 10 }),
        description: faker.lorem.paragraph(3),
        websiteUrl: faker.internet.url(),
      };

      const response = await request(server)
        .put(`${endpoints.bloggerController}/${blog.id}`)
        .auth(user1.accessToken, { type: 'bearer' })
        .send(updateBlogDto);
      expect(response.status).toBe(403);
    });

    it('should return 204 status code because all is ok', async () => {
      const { user, blog } = expect.getState();

      const updateBlogDto: UpdateBlogDto = {
        name: faker.lorem.word({ length: 10 }),
        description: faker.lorem.paragraph(3),
        websiteUrl: faker.internet.url(),
      };

      const response = await request(server)
        .put(`${endpoints.bloggerController}/${blog.id}`)
        .auth(user.accessToken, { type: 'bearer' })
        .send(updateBlogDto);

      expect(response.status).toBe(204);

      const getResponse = await request(server).get(endpoints.bloggerController).auth(user.accessToken, { type: 'bearer' });

      expect(getResponse.status).toBe(200);
      expect(getResponse.body.items).toHaveLength(1);
      expect(getResponse.body.items[0]).not.toEqual(blog);
      expect(getResponse.body.items[0]).toEqual({
        id: blog.id,
        name: updateBlogDto.name,
        description: updateBlogDto.description,
        websiteUrl: updateBlogDto.websiteUrl,
        createdAt: blog.createdAt,
      });
    });
  });

  describe('Delete => /blogger/blogs/:id => Delete blog specified by id', () => {
    it('should wipe all data for describe', async () => {
      await wipeAllData(server);
    });
    it('prepare data for describe (users, blog)', async () => {
      const [user, user1] = await testingUser.createAndLoginUsers(2);
      const blog = await testingBlog.createOneBlog(user.accessToken);

      expect(user && blog).toBeDefined();
      expect.setState({ user, user1, blog });
    });

    it('should return 401 status code because without auth', async () => {
      const response = await request(server).delete(`${endpoints.bloggerController}/123`);
      expect(response.status).toBe(401);
    });

    it('should return 404 status code because blog with id "-1" does not exists', async () => {
      const { user } = expect.getState();

      const response = await request(server).delete(`${endpoints.bloggerController}/-1`).auth(user.accessToken, { type: 'bearer' });
      expect(response.status).toBe(404);
    });

    it('should return 403 status code because user try to update blog that doesnt belong to current user', async () => {
      const { user1, blog } = expect.getState();

      const response = await request(server)
        .delete(`${endpoints.bloggerController}/${blog.id}`)
        .auth(user1.accessToken, { type: 'bearer' });
      expect(response.status).toBe(403);
    });

    it('should return 204 status code because all is ok', async () => {
      const { user, blog } = expect.getState();

      const getResponseBeforeDelete = await request(server).get(endpoints.bloggerController).auth(user.accessToken, { type: 'bearer' });
      expect(getResponseBeforeDelete.status).toBe(200);
      expect(getResponseBeforeDelete.body.items).toHaveLength(1);

      const deleteResponse = await request(server)
        .delete(`${endpoints.bloggerController}/${blog.id}`)
        .auth(user.accessToken, { type: 'bearer' });

      expect(deleteResponse.status).toBe(204);

      const getResponse = await request(server).get(endpoints.bloggerController).auth(user.accessToken, { type: 'bearer' });

      expect(getResponse.status).toBe(200);
      expect(getResponse.body.items).toHaveLength(0);
    });
  });

  describe('POST => /blogger/blogs/ => Create new blog', () => {
    it('should wipe all data for describe', async () => {
      await wipeAllData(server);
    });
    it('prepare data for describe (user)', async () => {
      const user = await testingUser.createAndLoginOneUser();

      expect(user).toBeDefined();
      expect.setState({ user });
    });

    it('should return 401 status code because without auth', async () => {
      const response = await request(server).post(`${endpoints.bloggerController}`);
      expect(response.status).toBe(401);
    });

    it('should return 400 status code because without auth', async () => {
      const { user } = expect.getState();

      const url = endpoints.bloggerController;
      const errors = {
        errorsMessages: expect.arrayContaining([
          {
            message: expect.any(String),
            field: 'name',
          },
          {
            message: expect.any(String),
            field: 'description',
          },
          {
            message: expect.any(String),
            field: 'websiteUrl',
          },
        ]),
      };

      const response = await request(server).post(url).auth(user.accessToken, { type: 'bearer' }).send({});
      expect(response.status).toBe(400);
      expect(response.body).toStrictEqual(errors);

      const emptyCreateBlogDto: CreateBlogDto = {
        name: '',
        description: '',
        websiteUrl: '',
      };

      const response1 = await request(server).post(url).auth(user.accessToken, { type: 'bearer' }).send(emptyCreateBlogDto);
      expect(response1.status).toBe(400);
      expect(response1.body).toStrictEqual(errors);

      const maxLenLimitCreateBlogDto: CreateBlogDto = {
        name: faker.lorem.paragraphs(15),
        description: faker.lorem.paragraphs(50),
        websiteUrl: faker.lorem.paragraphs(15),
      };

      const response2 = await request(server).post(url).auth(user.accessToken, { type: 'bearer' }).send(maxLenLimitCreateBlogDto);
      expect(response2.status).toBe(400);
      expect(response2.body).toStrictEqual(errors);
    });

    it('should return 201 status code because all is ok', async () => {
      const { user } = expect.getState();

      const createBlogDto: CreateBlogDto = {
        name: faker.lorem.word({ length: 10 }),
        description: faker.lorem.paragraph(3),
        websiteUrl: faker.internet.url(),
      };

      const response = await request(server)
        .post(endpoints.bloggerController)
        .auth(user.accessToken, { type: 'bearer' })
        .send(createBlogDto);

      expect(response.status).toBe(201);

      const getResponse = await request(server).get(endpoints.bloggerController).auth(user.accessToken, { type: 'bearer' });

      expect(getResponse.status).toBe(200);
      expect(getResponse.body.items).toHaveLength(1);
      expect(getResponse.body.items[0]).toEqual({
        id: expect.any(String),
        name: createBlogDto.name,
        description: createBlogDto.description,
        websiteUrl: createBlogDto.websiteUrl,
        createdAt: expect.any(String),
      });
      expect(isUUID(getResponse.body.items[0].id)).toBeTruthy();
    });
  });

  describe('GET => /blogger/blogs/ => Returns blogs (for which current user is owner) with paging', () => {
    const blogsTotalCount = 100;
    it('should wipe all data for describe', async () => {
      await wipeAllData(server);
    });
    it('prepare data for describe (users, blogs by first user)', async () => {
      const [user, user1] = await testingUser.createAndLoginUsers(2);
      const blogs = await testingBlog.createBlogs(user.accessToken, blogsTotalCount);
      expect(user && user1 && blogs).toBeDefined();
      expect.setState({ user, user1, blogs });
    });

    it('should return 401 status code because without auth', async () => {
      const response = await request(server).get(endpoints.bloggerController);
      expect(response.status).toBe(401);
    });

    it('should return 200 status code and 0 blogs for second user', async () => {
      const { user1 } = expect.getState();

      const response = await request(server).get(endpoints.bloggerController).auth(user1.accessToken, { type: 'bearer' });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ page: 1, pageSize: 10, pagesCount: 1, totalCount: 0, items: [] });
      expect(response.body.items).toHaveLength(0);
    });

    it('should return default pagination', async () => {
      const { user, blogs } = expect.getState();
      const blogsForTest = [...blogs];

      // const url = getUrlWithPagination(endpoints.bloggerController, '', '', '', '', '');
      const url = endpoints.bloggerController;
      const response = await request(server).get(url).auth(user.accessToken, { type: 'bearer' });

      expect(response.status).toBe(200);
      expect(response.body.page).toBe(1);
      expect(response.body.pageSize).toBe(10);
      expect(response.body.pagesCount).toBe(10);
      expect(response.body.totalCount).toBe(blogsTotalCount);
      expect(response.body.items).toHaveLength(10);
      expect(response.body.items).toEqual(blogsForTest.reverse().slice(0, 10));
    });

    it('should return pagination with sorting by ASC', async () => {
      const { user, blogs } = expect.getState();
      const blogsForTest = [...blogs];

      // const url = getUrlWithPagination(endpoints.bloggerController, '', '', '', '', 'asc');
      const url = `${endpoints.bloggerController}?sortDirection=asc`;
      const response = await request(server).get(url).auth(user.accessToken, { type: 'bearer' });

      expect(response.status).toBe(200);
      expect(response.body.page).toBe(1);
      expect(response.body.pageSize).toBe(10);
      expect(response.body.pagesCount).toBe(10);
      expect(response.body.totalCount).toBe(blogsTotalCount);
      expect(response.body.items).toHaveLength(10);
      expect(response.body.items).toEqual(blogsForTest.slice(0, 10));
    });

    it('should return pagination with page size settings', async () => {
      const { user, blogs } = expect.getState();
      const blogsForTest = [...blogs];

      // const url = getUrlWithPagination(endpoints.bloggerController, '', '', '', '', '', 0, 100);
      const url = `${endpoints.bloggerController}?pageSize=100`;
      const response = await request(server).get(url).auth(user.accessToken, { type: 'bearer' });

      expect(response.status).toBe(200);
      expect(response.body.page).toBe(1);
      expect(response.body.pageSize).toBe(100);
      expect(response.body.pagesCount).toBe(1);
      expect(response.body.totalCount).toBe(blogsTotalCount);
      expect(response.body.items).toHaveLength(blogsTotalCount);
      expect(response.body.items).toEqual(blogsForTest.reverse());
    });
    it('should return pagination with pages count and page size settings', async () => {
      const { user, blogs } = expect.getState();
      const blogsForTest = [...blogs];

      // const url = getUrlWithPagination(endpoints.bloggerController, '', '', '', '', '', 0, 100);
      const pageNumber = 5;
      const pageSize = 15;
      const url = `${endpoints.bloggerController}?pageNumber=${pageNumber}&pageSize=${pageSize}`;
      const response = await request(server).get(url).auth(user.accessToken, { type: 'bearer' });

      expect(response.status).toBe(200);
      expect(response.body.page).toBe(pageNumber);
      expect(response.body.pageSize).toBe(pageSize);
      expect(response.body.pagesCount).toBe(Math.ceil(blogsTotalCount / pageSize));
      expect(response.body.totalCount).toBe(blogsTotalCount);
      expect(response.body.items).toHaveLength(pageSize);
      expect(response.body.items).toEqual(
        blogsForTest.reverse().slice((pageNumber - 1) * pageSize, (pageNumber - 1) * pageSize + pageSize),
      );
    });
    it('should return blogs by searchNameTerm', async () => {
      const { user, blogs } = expect.getState();
      const blogsForTest = [...blogs];

      const searchNameTerm = '9';
      const pageSize = 100;
      const url = `${endpoints.bloggerController}?searchNameTerm=${searchNameTerm}&pageSize=${pageSize}`;

      const filteredBlogs = blogsForTest.filter((b) => b.name.includes(searchNameTerm));

      const response = await request(server).get(url).auth(user.accessToken, { type: 'bearer' });

      expect(response.status).toBe(200);
      expect(response.body.page).toBe(1);
      expect(response.body.pageSize).toBe(pageSize);
      expect(response.body.pagesCount).toBe(Math.ceil(filteredBlogs.length / pageSize));
      expect(response.body.totalCount).toBe(filteredBlogs.length);
      expect(response.body.items).toHaveLength(filteredBlogs.length);
      expect(response.body.items).toEqual(filteredBlogs.reverse());
    });
  });

  describe.skip('POST => /blogger/blogs/:blogId/posts => Create new post for specific blog', () => {});
});
