import supertest from 'supertest';
import { INestApplication } from '@nestjs/common';
import { endpoints } from './routing';
import { Blog } from '../../src/modules/blog/models/blogs.schema';
import { preparedBlog, preparedPost, superUser } from './prepeared-data';
import { isUUID } from '@nestjs/common/utils/is-uuid';
import { Post } from '../../src/modules/post/models/post.schema';

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
  const blog = response.body;
  expect(blog).toEqual({
    id: expect.any(String),
    name: preparedBlog.valid.name,
    description: preparedBlog.valid.description,
    websiteUrl: preparedBlog.valid.websiteUrl,
  });
  expect(isUUID(blog.id)).toBeTruthy();
  return blog;
};

export const createNewPost = async (
  request: typeof supertest,
  app: INestApplication,
  blog: Blog,
): Promise<Post> => {
  const postInputData = preparedPost.generatePostInputData(blog);
  const response = await request(app.getHttpServer())
    .post(endpoints.postController)
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
  });
  expect(isUUID(post.id)).toBeTruthy();
  return post;
};
