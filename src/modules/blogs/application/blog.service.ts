import { Injectable } from '@nestjs/common';
import { CreateBlogDto } from '../dto/create-blog.dto';
import { UpdateBlogDto } from '../dto/update-blog.dto';
import { BlogRepositoryMongodb } from '../infrastructure/blog.repository.mongodb';
import { Blog } from '../models/blogs.schema';
import { randomUUID } from 'crypto';

@Injectable()
export class BlogService {
  constructor(private readonly blogRepository: BlogRepositoryMongodb) {}
  async createNewBlog(createBlogDto: CreateBlogDto) {
    const newBlog: Blog = {
      id: randomUUID(),
      name: createBlogDto.name,
      youtubeUrl: createBlogDto.youtubeUrl,
    };
    return this.blogRepository.createNewBlog(newBlog);
  }

  async getAllBlogs() {
    return this.blogRepository.getAllBlogs();
  }

  async getOneBlogById(id: string) {
    return this.blogRepository.getOneBlogById(id);
  }

  async updateOneBlogById(id: string, updateBlogDto: UpdateBlogDto) {
    return this.blogRepository.updateOneBlogById(id, updateBlogDto);
  }

  async deleteOneBlogById(id: string) {
    return this.blogRepository.deleteOneBlogById(id);
  }
}
