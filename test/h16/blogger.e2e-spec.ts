import { generateRandomString, getUrlWithPagination, wipeAllData } from '../helpers/general-functions';
import { CommentViewModel } from '../../src/modules/comment/models/comment-view-model';
import { endpoints } from '../helpers/routing';
import request from 'supertest';
import { UpdateBlogDto } from '../../src/modules/blog/dto/update-blog.dto';
import { faker } from '@faker-js/faker';
import { CreateBlogDto } from '../../src/modules/blog/dto/create-blog.dto';
import { isUUID } from '@nestjs/common/utils/is-uuid';
import { INestApplication } from '@nestjs/common';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { TestingBlog, TestingComment, TestingPost, TestingUser } from '../helpers/prepeared-data';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../../src/app.module';
import { createApp } from '../../src/helpers/create-app';
import { CreatePostDto } from '../../src/modules/post/dto/create-post.dto';
import { ReactionStatusEnum } from '../../src/modules/reaction/models/reaction.schema';

describe('Blogger endpoints', () => {
  const second = 1000;
  const minute = 60 * second;

  jest.setTimeout(minute);

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
      const post = await testingPost.createOnePostForBlog(blog.id, user.accessToken);
      const comments = await testingComment.createCommentsForPost(user.accessToken, post, countOfComments);
      expect(user && blog && post && comments).toBeDefined();
      expect.setState({ user, blog, post, comments });
    });
    it('should return all comments for all posts inside all current user blogs', async () => {
      const { user, post, comments } = expect.getState();

      const commentsSortByDesc = comments.reverse();

      const url = `${endpoints.bloggerController}/comments`;
      const response = await request(server).get(url).auth(user.accessToken, { type: 'bearer' });

      expect(response).toBeDefined();
      expect(response.body.items).toHaveLength(countOfComments);
      for (const i in commentsSortByDesc) {
        expect(response.body.items[i]).toEqual({
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
    it('should return the same number of elements as the page size', async () => {
      const { user } = expect.getState();

      const url = `${endpoints.bloggerController}/comments`;

      const firstPageSizeCount = 3;
      const firstPageSizeUrl = getUrlWithPagination(url, { pageSize: firstPageSizeCount });
      const firstPageSizeResponse = await request(server).get(firstPageSizeUrl).auth(user.accessToken, { type: 'bearer' });

      expect(firstPageSizeResponse.status).toBe(200);
      expect(firstPageSizeResponse.body.items).toHaveLength(firstPageSizeCount);

      const secondPageSizeCount = 7;
      const secondPageSizeUrl = getUrlWithPagination(url, { pageSize: secondPageSizeCount });
      const secondPageSizeResponse = await request(server).get(secondPageSizeUrl).auth(user.accessToken, { type: 'bearer' });

      expect(secondPageSizeResponse.status).toBe(200);
      expect(secondPageSizeResponse.body.items).toHaveLength(secondPageSizeCount);
    });

    it('should return comments with correct asc/desc sorting', async () => {
      const { user } = expect.getState();

      const url = `${endpoints.bloggerController}/comments`;

      const sortByDescUrl = getUrlWithPagination(url, { sortDirection: 'desc' });
      const sortByDescResponse = await request(server).get(sortByDescUrl).auth(user.accessToken, { type: 'bearer' });
      expect(sortByDescResponse.status).toBe(200);

      const sortByAscUrl = getUrlWithPagination(url, { sortDirection: 'asc' });
      const sortByAscResponse = await request(server).get(sortByAscUrl).auth(user.accessToken, { type: 'bearer' });
      expect(sortByAscResponse.status).toBe(200);
      expect(sortByAscResponse.body.items).toEqual(sortByDescResponse.body.items.reverse());
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
        isMembership: false,
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
      const response = await testingBlog.createOneBlogWithFullResponse({} as CreateBlogDto, 'user.accessToken');
      expect(response.status).toBe(401);
    });

    it('should return 400 status code because invalid input data', async () => {
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

      const response = await testingBlog.createOneBlogWithFullResponse({} as CreateBlogDto, user.accessToken);
      expect(response.status).toBe(400);
      expect(response.body).toStrictEqual(errors);

      const emptyCreateBlogDto: CreateBlogDto = {
        name: '',
        description: '',
        websiteUrl: '',
      };

      const response1 = await testingBlog.createOneBlogWithFullResponse(emptyCreateBlogDto, user.accessToken);
      expect(response1.status).toBe(400);
      expect(response1.body).toStrictEqual(errors);

      const maxLenLimitCreateBlogDto: CreateBlogDto = {
        name: faker.lorem.paragraphs(15),
        description: faker.lorem.paragraphs(50),
        websiteUrl: faker.lorem.paragraphs(15),
      };

      const response2 = await testingBlog.createOneBlogWithFullResponse(maxLenLimitCreateBlogDto, user.accessToken);
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

      const response = await testingBlog.createOneBlogWithFullResponse(createBlogDto, user.accessToken);

      const blog = response.body;
      expect(response.status).toBe(201);

      expect(blog).toEqual({
        id: expect.any(String),
        name: createBlogDto.name,
        description: createBlogDto.description,
        websiteUrl: createBlogDto.websiteUrl,
        createdAt: expect.any(String),
        isMembership: false,
      });
      expect(isUUID(blog.id)).toBeTruthy();

      expect.setState({ blog });
    });

    it('should return 200 status code and created blog', async () => {
      const { blog } = expect.getState();

      const response = await request(server).get(`${endpoints.blogController}/${blog.id}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(blog);
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

      const url = getUrlWithPagination(endpoints.bloggerController, { sortDirection: 'asc' });
      console.log(url);

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

  describe('POST => /blogger/blogs/:blogId/posts => Create new post for specific blog', () => {
    it('should wipe all data for describe', async () => {
      await wipeAllData(server);
    });

    it('prepare data for describe (user, blog, post, comments)', async () => {
      const [user, user1] = await testingUser.createAndLoginUsers(2);
      const blog = await testingBlog.createOneBlog(user.accessToken);
      expect(user && user1 && blog).toBeDefined();
      expect.setState({ user, user1, blog });
    });

    it('should return 401 status code because without auth', async () => {
      const { blog } = expect.getState();

      const response = await testingPost.createOnePostWithFullResponse({} as CreatePostDto, blog.id, 'user.accessToken');
      expect(response.status).toBe(401);
    });

    it("should return 404 status code because specific blog doesn't exists", async () => {
      const { user } = expect.getState();

      const createPostDto: CreatePostDto = { title: 'title', shortDescription: 'shortDescription', content: 'content' };

      const response = await testingPost.createOnePostWithFullResponse(createPostDto, '-1', user.accessToken);

      expect(response.status).toBe(404);
    });

    it('should return 400 status code because invalid input data', async () => {
      const { user, blog } = expect.getState();

      const url = `${endpoints.bloggerController}/${blog.id}/posts`;
      const errors = {
        errorsMessages: expect.arrayContaining([
          {
            message: expect.any(String),
            field: 'title',
          },
          {
            message: expect.any(String),
            field: 'shortDescription',
          },
          {
            message: expect.any(String),
            field: 'content',
          },
        ]),
      };

      const response = await testingPost.createOnePostWithFullResponse({} as CreatePostDto, blog.id, user.accessToken);
      expect(response.status).toBe(400);
      expect(response.body).toStrictEqual(errors);

      const emptyCreatePostDto: CreatePostDto = {
        title: '',
        shortDescription: '',
        content: '',
      };

      const response1 = await testingPost.createOnePostWithFullResponse(emptyCreatePostDto, blog.id, user.accessToken);
      expect(response1.status).toBe(400);
      expect(response1.body).toStrictEqual(errors);

      const maxLenLimitCreatePostDto: CreatePostDto = {
        title: faker.lorem.paragraphs(25),
        shortDescription: faker.lorem.paragraphs(50),
        content: faker.lorem.paragraphs(25),
      };

      const response2 = await testingPost.createOnePostWithFullResponse(maxLenLimitCreatePostDto, blog.id, user.accessToken);
      expect(response2.status).toBe(400);
      expect(response2.body).toStrictEqual(errors);
    });

    it("should return 403 status code because user try to add post to blog that doesn't belong to current user", async () => {
      const { user1, blog } = expect.getState();
      const createPostDto: CreatePostDto = {
        title: generateRandomString(15),
        shortDescription: generateRandomString(50),
        content: generateRandomString(500),
      };

      const response = await testingPost.createOnePostWithFullResponse(createPostDto, blog.id, user1.accessToken);

      expect(response.status).toBe(403);
    });

    it('should return 201 status code because all is ok', async () => {
      const { user, blog } = expect.getState();

      const createPostDto: CreatePostDto = {
        title: generateRandomString(15),
        shortDescription: generateRandomString(50),
        content: generateRandomString(500),
      };

      const response = await testingPost.createOnePostWithFullResponse(createPostDto, blog.id, user.accessToken);

      const post = response.body;
      expect(response.status).toBe(201);

      expect(post).toEqual({
        id: expect.any(String),
        title: createPostDto.title,
        shortDescription: createPostDto.shortDescription,
        content: createPostDto.content,
        blogId: blog.id,
        blogName: blog.name,
        createdAt: expect.any(String),
        extendedLikesInfo: {
          likesCount: 0,
          dislikesCount: 0,
          myStatus: ReactionStatusEnum.None,
          newestLikes: [],
        },
      });
      expect(isUUID(post.id)).toBeTruthy();

      expect.setState({ post });
    });

    it('should return 200 status code and created blog', async () => {
      const { post } = expect.getState();

      const response = await request(server).get(`${endpoints.postController}/${post.id}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(post);
    });
  });
});
