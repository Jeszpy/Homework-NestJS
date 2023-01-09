import { Module } from '@nestjs/common';
import { BloggerController } from './blogger.controller';

@Module({
  controllers: [BloggerController],
  providers: [],
})
export class BloggerModule {}
