import supertest from 'supertest';
import { INestApplication } from '@nestjs/common';
import { endpoints } from './routing';

export const wipeAllData = async (
  request: typeof supertest,
  app: INestApplication,
) => {
  const url = endpoints.testingController.allData;
  const response = await request(app.getHttpServer()).delete(url);
  return response;
};
