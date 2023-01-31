import { endpoints } from './routing';
import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';

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

export const getUrlWithPagination = (
  endpoint: string,
  searchNameTerm?: string,
  searchLoginTerm?: string,
  searchEmailTerm?: string,
  sortBy?: string,
  sortDirection?: string,
  pageNumber?: number,
  pageSize?: number,
): string => {
  // console.log('getUrlWithPagination => sortDirection', sortDirection);
  console.log('getUrlWithPagination => pageSize', pageSize);
  let result = `${endpoint}?`;
  searchNameTerm ? (result += `searchNameTerm=${searchNameTerm}&`) : '';
  searchLoginTerm ? (result += `searchLoginTerm=${searchLoginTerm}&`) : '';
  searchEmailTerm ? (result += `searchEmailTerm=${searchEmailTerm}&`) : '';
  sortBy ? (result += `sortBy=${sortBy}&`) : '';
  sortDirection ? (result += `sortDirection=${sortDirection}&`) : '';
  pageNumber ? (result += `pageNumber=${pageNumber}&`) : '';
  pageSize ? (result += `searchNameTerm=${pageSize}`) : '';
  return result;
};

// export const sortDirectionDesc = (items: any[], sortBy: string, returnedCount: number) => {};
