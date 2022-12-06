import { Module } from '@nestjs/common';
import { PostService } from './application/post.service';
import { PostController } from './api/post.controller';
import { PostRepositoryMongodb } from './infrastructure/post.repository.mongodb';
import { PostQueryRepositoryMongodb } from './infrastructure/post-query.repository.mongodb';
import { MongooseModule } from '@nestjs/mongoose';
import { Post, PostSchema } from './models/post.schema';
import { Blog, BlogSchema } from '../blog/models/blog.schema';
import { BlogQueryRepository } from '../blog/interfaces/IBlogQueryRepository';
import { BlogExistsValidator } from '../../validators/blog-exists.validator';

const schemas = [
  { name: Blog.name, schema: BlogSchema },
  { name: Post.name, schema: PostSchema },
];

@Module({
  imports: [MongooseModule.forFeature(schemas)],
  controllers: [PostController],
  providers: [
    PostService,
    PostRepositoryMongodb,
    PostQueryRepositoryMongodb,
    BlogQueryRepository(),
    BlogExistsValidator,
  ],
})
export class PostModule {}
