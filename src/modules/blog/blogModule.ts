import { Module } from '@nestjs/common';
import { BlogService } from './application/blog.service';
import { BlogController } from './api/blogController';
import { BlogRepositoryMongodb } from './infrastructure/blog.repository.mongodb';
import { MongooseModule } from '@nestjs/mongoose';
import { Blog, BlogSchema } from './models/blogs.schema';
import { BlogQueryRepositoryMongodb } from './infrastructure/blog-query.repository.mongodb';
import { IBlogQueryRepository } from './interfaces/IBlogQueryRepository';
import { PostRepositoryMongodb } from '../post/infrastructure/post.repository.mongodb';
import { Post, PostSchema } from '../post/models/post.schema';
import { PostService } from '../post/application/post.service';

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
    { provide: IBlogQueryRepository, useClass: BlogQueryRepositoryMongodb },
    PostRepositoryMongodb,
  ],
  //TODO: если будут циклические зависимости - раскоментить
  // exports: [IBlogQueryRepository],
})
export class BlogModule {}
