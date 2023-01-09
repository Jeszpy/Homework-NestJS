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
  return response;
};
