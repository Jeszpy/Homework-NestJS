import { Module } from '@nestjs/common';
import { TestingService } from './application/testing.service';
import { TestingController } from './api/testing.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Video, VideoSchema } from '../video/models/video.schema';
import { TestingRepository } from './infrastructure/testing.repository.mongodb';
import { Blog, BlogSchema } from '../blog/models/blog.schema';
import { Post, PostSchema } from '../post/models/post.schema';
import { User, UserSchema } from '../user/models/user.schema';

const schemas = [
  { name: Video.name, schema: VideoSchema },
  { name: Blog.name, schema: BlogSchema },
  { name: Post.name, schema: PostSchema },
  { name: User.name, schema: UserSchema },
];

@Module({
  imports: [MongooseModule.forFeature(schemas)],
  controllers: [TestingController],
  providers: [TestingService, TestingRepository],
})
export class TestingModule {}
