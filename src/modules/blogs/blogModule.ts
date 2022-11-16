import { Module } from '@nestjs/common';
import { BlogService } from './application/blog.service';
import { BlogController } from './api/blogController';
import { BlogRepositoryMongodb } from './infrastructure/blog.repository.mongodb';
import { MongooseModule } from '@nestjs/mongoose';
import { Blog, BlogSchema } from './models/blogs.schema';
import { BlogQueryRepositoryMongodb } from './infrastructure/blog-query.repository.mongodb';

const schemas = [{ name: Blog.name, schema: BlogSchema }];

@Module({
  imports: [MongooseModule.forFeature(schemas)],
  controllers: [BlogController],
  providers: [BlogService, BlogRepositoryMongodb, BlogQueryRepositoryMongodb],
})
export class BlogModule {}
