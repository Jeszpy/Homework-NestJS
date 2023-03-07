import { endpoints } from './routing';
import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import crypto from 'crypto';

export const startMongoMemoryServer = async () => {
  const mongoMemoryServer = await MongoMemoryServer.create();
  const mongoUri = mongoMemoryServer.getUri();
  process.env['MONGO_URI'] = mongoUri;
  return true;
};

export const wipeAllData = async (server: any) => {
  const url = endpoints.testingController.allData;
  return request(server).delete(url);
};

type TestsPaginationType = Partial<{
  searchNameTerm: string;
  searchLoginTerm: string;
  searchEmailTerm: string;
  searchBodyTerm: string;
  sortBy: string;
  sortDirection: 'asc' | 'desc';
  pageNumber: number;
  pageSize: number;
}>;

export const getUrlWithPagination = (
  endpoint: string,
  {
    searchNameTerm = null,
    searchLoginTerm = null,
    searchEmailTerm = null,
    searchBodyTerm = null,
    sortBy = 'createdAt',
    sortDirection = 'desc',
    pageNumber = 1,
    pageSize = 10,
  }: TestsPaginationType,
): string => {
  let result = `${endpoint}?`;
  if (searchNameTerm) {
    result += `searchNameTerm=${searchNameTerm}&`;
  }
  if (searchLoginTerm) {
    result += `searchLoginTerm=${searchLoginTerm}&`;
  }
  if (searchEmailTerm) {
    result += `searchEmailTerm=${searchEmailTerm}&`;
  }
  if (searchBodyTerm) {
    result += `searchBodyTerm=${searchBodyTerm}&`;
  }
  result += `sortBy=${sortBy}&`;
  result += `sortDirection=${sortDirection}&`;
  result += `pageNumber=${pageNumber}&`;
  result += `pageSize=${pageSize}`;
  return result;
};

export const generateRandomString = (length: number): string => {
  return crypto.randomBytes(length).toString();
};
