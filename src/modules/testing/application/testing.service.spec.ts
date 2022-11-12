import { Test, TestingModule } from '@nestjs/testing';
import { TestingService } from './testing.service';

describe('TestingService', () => {
  let service: TestingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TestingService],
    }).compile();

    service = module.get<TestingService>(TestingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
