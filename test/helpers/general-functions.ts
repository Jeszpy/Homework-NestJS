import supertest from 'supertest';
import { INestApplication } from '@nestjs/common';
import { endpoints } from './routing';
import { Blog } from '../../src/modules/blog/models/blog.schema';
import { preparedBlog, preparedPost, superUser } from './prepeared-data';
import { isUUID } from '@nestjs/common/utils/is-uuid';
import { Post } from '../../src/modules/post/models/post.schema';
import { BlogViewModel } from '../../src/modules/blog/models/blog-view-model';

export const wipeAllData = async (
  request: typeof supertest,
  app: INestApplication,
) => {
  const url = endpoints.testingController.allData;
  const response = await request(app.getHttpServer()).delete(url);
  expect(response.status).toBe(204);
  expect(response.body).toEqual({});
  return true;
};

export const createNewBlog = async (
  request: typeof supertest,
  app: INestApplication,
): Promise<Blog> => {
  const response = await request(app.getHttpServer())
    .post(endpoints.blogController)
    .auth(superUser.login, superUser.password, { type: 'basic' })
    .send(preparedBlog.valid);
  expect(response).toBeDefined();
  expect(response.status).toBe(201);
  const blog: BlogViewModel = response.body;
  expect(blog).toEqual({
    id: expect.any(String),
    name: preparedBlog.valid.name,
    description: preparedBlog.valid.description,
    websiteUrl: preparedBlog.valid.websiteUrl,
    createdAt: expect.any(String),
  });
  expect(isUUID(blog.id)).toBeTruthy();
  expect(new Date(blog.createdAt) < new Date()).toBeTruthy();
  return blog;
};

export const createNewPost = async (
  request: typeof supertest,
  app: INestApplication,
  blog: Blog,
  endpoint: string = endpoints.postController,
): Promise<Post> => {
  const postInputData = preparedPost.generatePostInputData(blog);
  const response = await request(app.getHttpServer())
    .post(endpoint)
    .auth(superUser.login, superUser.password, { type: 'basic' })
    .send(postInputData);

  expect(response).toBeDefined();
  expect(response.status).toBe(201);
  const post = response.body;
  expect(post).toEqual({
    id: expect.any(String),
    title: preparedPost.valid.title,
    shortDescription: preparedPost.valid.shortDescription,
    content: preparedPost.valid.content,
    blogId: blog.id,
    blogName: blog.name,
    createdAt: expect.any(String),
  });
  expect(isUUID(post.id)).toBeTruthy();
  expect(new Date(post.createdAt) < new Date()).toBeTruthy();
  return post;
};
