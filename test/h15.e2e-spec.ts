import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { createApp } from '../src/helpers/create-app';
import request from 'supertest';
import { endpoints } from './helpers/routing';
import { superUser, TestingUser } from './helpers/prepeared-data';
import { UserQueryRepositoryMongodb } from '../src/modules/user/infrastructure/user-query.repository.mongodb';
import { BanUserDto } from '../src/modules/user/dto/ban-user.dto';
import { faker } from '@faker-js/faker';
import { BlogQueryRepositoryMongodb } from '../src/modules/blog/infrastructure/blog-query.repository.mongodb';
import { PostQueryRepositoryMongodb } from '../src/modules/post/infrastructure/post-query.repository.mongodb';
import { CreateBlogDto } from '../src/modules/blog/dto/create-blog.dto';
import { BlogViewModel } from '../src/modules/blog/models/blog-view-model';
import { CreatePostDto } from '../src/modules/post/dto/create-post.dto';
import { ReactionStatusEnum } from '../src/modules/reaction/models/reaction.schema';
import { PostViewModel } from '../src/modules/post/models/post-view-model';
import { CreateCommentDto } from '../src/modules/comment/dto/create-comment.dto';
import { CommentViewModel } from '../src/modules/comment/models/comment-view-model';
import { CommentQueryRepositoryMongodb } from '../src/modules/comment/infrastructure/comment-query.repository.mongodb';
import { ReactionStatusDto } from '../src/modules/comment/dto/reaction-status.dto';
import { TestingRepository } from '../src/modules/testing/infrastructure/testing.repository.mongodb';
import { startMongoMemoryServer } from './helpers/general-functions';
import { MongoMemoryServer } from 'mongodb-memory-server';

describe('Homework №15', () => {
  // user (=== blogger)
  // blog
  // public api => get blogs
  const second = 1000;
  const minute = 60 * second;

  jest.setTimeout(5 * minute);

  let app: INestApplication;
  let server;
  let mongoMemoryServer;

  let testingRepo: TestingRepository;
  let userQueryRepo: UserQueryRepositoryMongodb;
  // let blogQueryRepo: BlogQueryRepositoryMongodb;
  let postQueryRepo: PostQueryRepositoryMongodb;
  let commentQueryRepo: CommentQueryRepositoryMongodb;

  let testingUser: TestingUser;

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
    testingRepo = app.get(TestingRepository);
    userQueryRepo = app.get(UserQueryRepositoryMongodb);
    // blogQueryRepo = app.get(BlogQueryRepositoryMongodb);
    postQueryRepo = app.get(PostQueryRepositoryMongodb);
    commentQueryRepo = app.get(CommentQueryRepositoryMongodb);
  });

  afterAll(async () => {
    await app.close();
    await mongoMemoryServer.stop();
  });

  describe('Wipe all data before tests', () => {
    it('should wipe all data in DB and return 204 status code', async () => {
      const url = endpoints.testingController.allData;
      const response = await request(app.getHttpServer()).delete(url);
      expect(response).toBeDefined();
      expect(response.status).toBe(204);
      expect(response.body).toEqual({});
      const countOfDbElements = await testingRepo.getCountOfAllElementsInDb();
      expect(countOfDbElements).toBe(0);
    });
    it('/videos (GET) should return empty array', async () => {
      const response = await request(server).get(endpoints.videoController);

      expect(response).toBeDefined();
      expect(response.status).toBe(200);
      expect(response.body).toStrictEqual([]);
    });
  });

  describe('test user ban/unban logic', () => {
    it('should wipe all data in DB and return 204 status code', async () => {
      const url = endpoints.testingController.allData;
      const response = await request(app.getHttpServer()).delete(url);
      expect(response.status).toBe(204);
      expect(response.body).toEqual({});
    });
    it('should ban user', async () => {
      const user = await testingUser.createAndLoginOneUser();
      expect.setState({ user });

      const userFromDb = await userQueryRepo.findUserById(user.id);
      expect(userFromDb.banInfo.isBanned).toBe(false);

      const banDto: BanUserDto = {
        isBanned: true,
        banReason: faker.random.alpha(20),
      };

      const banUser = await request(server)
        .put(`${endpoints.usersController}/${user.id}/ban`)
        .auth(superUser.login, superUser.password, { type: 'basic' })
        .send(banDto);

      expect(banUser.status).toBe(204);
      const userFromDbAfterBan = await userQueryRepo.findUserById(user.id);
      expect(userFromDbAfterBan.banInfo.isBanned).toBe(true);
    });
    it('should unban user', async () => {
      const { user } = expect.getState();
      const unbanDto: BanUserDto = {
        isBanned: false,
        banReason: faker.random.alpha(20),
      };

      const unbanUser = await request(server)
        .put(`${endpoints.usersController}/${user.id}/ban`)
        .auth(superUser.login, superUser.password, { type: 'basic' })
        .send(unbanDto);

      expect(unbanUser.status).toBe(204);
      const userFromDbAfterUnban = await userQueryRepo.findUserById(user.id);
      expect(userFromDbAfterUnban.banInfo.isBanned).toBe(false);
    });
  });

  describe('test show comments logic with banned comment owner', () => {
    it('prepare user, blog, post, comment for test', async () => {
      const [user0, user1] = await testingUser.createAndLoginUsers(2);

      const getBlogsAfterCreate = await request(server).get(endpoints.blogController);

      expect(getBlogsAfterCreate.status).toBe(200);
      expect(getBlogsAfterCreate.body.items.length).toBe(0);

      const createBlogDto: CreateBlogDto = {
        name: 'name',
        description: 'description',
        websiteUrl: faker.internet.url(),
      };

      const createBlogResponse = await request(server)
        .post(endpoints.bloggerController)
        .auth(user0.accessToken, { type: 'bearer' })
        .send(createBlogDto);

      expect(createBlogResponse.status).toBe(201);

      const blog: BlogViewModel = createBlogResponse.body;
      expect(blog).toEqual({
        id: expect.any(String),
        name: createBlogDto.name,
        description: createBlogDto.description,
        websiteUrl: createBlogDto.websiteUrl,
        createdAt: expect.any(String),
      });

      const getBlogsBeforeCreate = await request(server).get(endpoints.blogController);
      expect(getBlogsBeforeCreate.status).toBe(200);
      expect(getBlogsBeforeCreate.body.items.length).toBe(1);

      const getPostsAfterCreate = await request(server).get(endpoints.postController);
      expect(getPostsAfterCreate.status).toBe(200);
      expect(getPostsAfterCreate.body.items.length).toBe(0);

      const createPostDto: CreatePostDto = {
        title: 'title',
        content: 'content',
        shortDescription: 'shortDescription',
      };

      const createPostResponse = await request(server)
        .post(`${endpoints.bloggerController}/${blog.id}/posts`)
        .auth(user0.accessToken, { type: 'bearer' })
        .send(createPostDto);

      expect(createPostResponse.status).toBe(201);
      const post: PostViewModel = createPostResponse.body;
      expect(post).toEqual({
        id: expect.any(String),
        title: createPostDto.title,
        content: createPostDto.content,
        shortDescription: createPostDto.shortDescription,
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
      const getPostsBeforeCreate = await request(server).get(endpoints.postController);
      expect(getPostsBeforeCreate.status).toBe(200);
      expect(getPostsBeforeCreate.body.items.length).toBe(1);

      const commentsUrl = `${endpoints.postController}/${post.id}/comments`;
      const getCommentsAfterCreate = await request(server).get(commentsUrl);
      expect(getCommentsAfterCreate.status).toBe(200);
      expect(getCommentsAfterCreate.body.items.length).toBe(0);

      const commentDto: CreateCommentDto = {
        content: faker.lorem.words(10),
      };

      const createCommentResponse = await request(server).post(commentsUrl).auth(user0.accessToken, { type: 'bearer' }).send(commentDto);

      expect(createCommentResponse.status).toBe(201);
      const comment: CommentViewModel = createCommentResponse.body;
      expect(comment).toEqual({
        id: expect.any(String),
        content: commentDto.content,
        userId: user0.id,
        userLogin: user0.login,
        createdAt: expect.any(String),
        likesInfo: {
          likesCount: 0,
          dislikesCount: 0,
          myStatus: ReactionStatusEnum.None,
        },
      });

      const getCommentsBeforeCreate = await request(server).get(commentsUrl);
      expect(getCommentsBeforeCreate.status).toBe(200);
      expect(getCommentsBeforeCreate.body.items.length).toBe(1);

      expect.setState({ user0, user1, blog, post, comment });
    });
    it('should not show banned user comment', async () => {
      const { user0, user1, post, comment } = expect.getState();
      const banDto: BanUserDto = {
        isBanned: true,
        banReason: faker.random.alpha(20),
      };

      const banUser = await request(server)
        .put(`${endpoints.usersController}/${user0.id}/ban`)
        .auth(superUser.login, superUser.password, { type: 'basic' })
        .send(banDto);

      const commentFromDb = await commentQueryRepo.findCommentById(comment.id);
      expect(commentFromDb).toBeUndefined(); // because user is banned

      const commentsUrl = `${endpoints.postController}/${post.id}/comments`;
      const getCommentsForPost = await request(server).get(commentsUrl);
      expect(getCommentsForPost.status).toBe(200);
      expect(getCommentsForPost.body.items.length).toBe(0);

      const unbanDto: BanUserDto = {
        isBanned: false,
        banReason: faker.random.alpha(20),
      };

      const unbanUser = await request(server)
        .put(`${endpoints.usersController}/${user0.id}/ban`)
        .auth(superUser.login, superUser.password, { type: 'basic' })
        .send(unbanDto);

      const commentFromDbAfterUnban = await commentQueryRepo.findCommentById(comment.id);
      expect(commentFromDbAfterUnban).toBeDefined();

      const getCommentsForPostAfterUnban = await request(server).get(commentsUrl);
      expect(getCommentsForPostAfterUnban.status).toBe(200);
      expect(getCommentsForPostAfterUnban.body.items.length).toBe(1);
    });
    it('should wipe all data in DB and return 204 status code', async () => {
      const url = endpoints.testingController.allData;
      const response = await request(app.getHttpServer()).delete(url);
      expect(response.status).toBe(204);
      expect(response.body).toEqual({});
    });
  });

  describe('test show likes logic with banned users', () => {
    it('should wipe all data in DB and return 204 status code', async () => {
      const url = endpoints.testingController.allData;
      const response = await request(app.getHttpServer()).delete(url);
      expect(response.status).toBe(204);
    });
    it('prepare user', async () => {
      const [user0, user1, user2, user3, user4, user5, user6, user7, user8, user9] = await testingUser.createAndLoginUsers(10);
      expect.setState({ user0, user1, users: [user0, user1, user2, user3, user4, user5, user6, user7, user8, user9] });
    });
    it('prepare blog', async () => {
      const { user0 } = expect.getState();
      const createBlogDto: CreateBlogDto = {
        name: 'name',
        description: 'description',
        websiteUrl: faker.internet.url(),
      };

      const createBlogResponse = await request(server)
        .post(endpoints.bloggerController)
        .auth(user0.accessToken, { type: 'bearer' })
        .send(createBlogDto);

      const blog = createBlogResponse.body;
      expect.setState({ blog });
    });
    it('prepare post', async () => {
      const { user0, blog } = expect.getState();
      const createPostDto: CreatePostDto = {
        title: 'title',
        content: 'content',
        shortDescription: 'shortDescription',
      };

      const createPostResponse = await request(server)
        .post(`${endpoints.bloggerController}/${blog.id}/posts`)
        .auth(user0.accessToken, { type: 'bearer' })
        .send(createPostDto);

      const post: PostViewModel = createPostResponse.body;
      expect.setState({ post });
    });
    it('prepare comment', async () => {
      const { user0, post } = expect.getState();
      const commentsUrl = `${endpoints.postController}/${post.id}/comments`;
      const commentDto: CreateCommentDto = {
        content: faker.lorem.words(10),
      };
      const createCommentResponse = await request(server).post(commentsUrl).auth(user0.accessToken, { type: 'bearer' }).send(commentDto);
      const comment = createCommentResponse.body;
      const commentId = comment.id;

      const commentFromDb = await commentQueryRepo.findCommentById(commentId);
      console.log('commentFromDb', commentFromDb);
      expect(commentFromDb).toBeDefined();
      expect.setState({ comment });
    });
    it('prepare user, blog, post, comment, reaction for test', async () => {
      const { users, comment } = expect.getState();

      const commentId = comment.id;
      const reactionUrl = `${endpoints.commentController}/${commentId}/like-status`;
      const createReactionDto: ReactionStatusDto = {
        likeStatus: ReactionStatusEnum.Like,
      };

      const getReactionsBeforeCreate = await testingRepo.getAllReactions();
      expect(getReactionsBeforeCreate.length).toBe(0);

      for (const u of users) {
        const createReactionResponse = await request(server)
          .put(reactionUrl)
          .auth(u.accessToken, { type: 'bearer' })
          .send(createReactionDto);
        expect(createReactionResponse.status).toBe(204);
      }

      const getReactionsAfterCreate = await testingRepo.getAllReactions();
      console.log('getReactionsAfterCreate', getReactionsAfterCreate);
      expect(getReactionsAfterCreate.length).toBe(10);

      const getAllCommentsAfterAddReaction = await testingRepo.getAllComments();
      console.log('getAllCommentsAfterAddReaction', getAllCommentsAfterAddReaction);
      expect(getAllCommentsAfterAddReaction).toBeDefined();
      expect(getAllCommentsAfterAddReaction.length).toBe(1);

      const commentFromDbAfterReaction = await commentQueryRepo.findCommentById(commentId);
      console.log('commentFromDbAfterReaction', commentFromDbAfterReaction);
      expect(commentFromDbAfterReaction).toBeDefined();

      const getCommentUrl = `${endpoints.commentController}/${comment.id}`;
      console.log('getCommentUrl', getCommentUrl);
      const getCommentAfterAddReaction = await request(server).get(getCommentUrl);

      const commentAfterReaction = getCommentAfterAddReaction.body;
      console.log(commentAfterReaction);
      expect(getCommentAfterAddReaction.status).toBe(200);
      expect(commentAfterReaction).toEqual({
        id: comment.id,
        content: comment.content,
        userId: comment.userId,
        userLogin: comment.userLogin,
        createdAt: comment.createdAt,
        likesInfo: {
          likesCount: 10,
          dislikesCount: 0,
          myStatus: ReactionStatusEnum.None,
        },
      });
    });
  });

  // describe('test for create and login many users', () => {
  //   it('should wipe all data in DB and return 204 status code', async () => {
  //     const url = endpoints.testingController.allData;
  //     const response = await request(app.getHttpServer()).delete(url);
  //     expect(response.status).toBe(204);
  //   });
  //   it('should create and login many users', async () => {
  //     const countOfUsers = 1000;
  //     const start = +new Date();
  //     const users = await testingUser.createAndLoginUsers(countOfUsers);
  //     expect(users).toBeDefined();
  //     expect(users.length).toBe(countOfUsers);
  //     const finish = +new Date() - start;
  //     console.log(`test for create and login ${countOfUsers} finished at: ${finish / 1000} seconds`);
  //   });
  // });
});
