import { Module } from '@nestjs/common';
import { BlogService } from './application/blog.service';
import { BlogController } from './api/blog.controller';
import { BlogRepositoryMongodb } from './infrastructure/blog.repository.mongodb';
import { MongooseModule } from '@nestjs/mongoose';
import { Blog, BlogSchema } from './models/blog.schema';
import { BlogQueryRepository } from './interfaces/IBlogQueryRepository';
import { PostRepositoryMongodb } from '../post/infrastructure/post.repository.mongodb';
import { Post, PostSchema } from '../post/models/post.schema';
import { PostService } from '../post/application/post.service';
import { PostQueryRepositoryMongodb } from '../post/infrastructure/post-query.repository.mongodb';
import { TrimValidator } from '../../validators/trim.validator';

const schemas = [
  { name: Blog.name, schema: BlogSchema },
  { name: Post.name, schema: PostSchema },
];

@Module({
  imports: [MongooseModule.forFeature(schemas)],
  controllers: [BlogController],
  providers: [
    BlogService,
    PostService,
    BlogRepositoryMongodb,
    BlogQueryRepository(),
    PostRepositoryMongodb,
    PostQueryRepositoryMongodb,
    // TrimValidator,
  ],
  //TODO: если будут циклические зависимости - раскоментить
  // exports: [IBlogQueryRepository],
})
export class BlogModule {}
