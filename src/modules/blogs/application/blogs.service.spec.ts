import { Test, TestingModule } from '@nestjs/testing';
import { BlogService } from './blog.service';

describe('BlogsService', () => {
  let service: BlogService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BlogService],
    }).compile();

    service = module.get<BlogService>(BlogService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
