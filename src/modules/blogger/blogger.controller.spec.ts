import { Test, TestingModule } from '@nestjs/testing';
import { BloggerController } from './blogger.controller';
import { BloggerService } from './blogger.service';

describe('BloggerController', () => {
  let controller: BloggerController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BloggerController],
      providers: [BloggerService],
    }).compile();

    controller = module.get<BloggerController>(BloggerController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
