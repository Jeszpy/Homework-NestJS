import { Injectable } from '@nestjs/common';
import { TestingRepository } from '../infrastructure/testing.repository.mongodb';

@Injectable()
export class TestingService {
  constructor(private readonly testingRepository: TestingRepository) {}
  wipeAllData() {
    return this.testingRepository.wipeAllData();
  }
}
