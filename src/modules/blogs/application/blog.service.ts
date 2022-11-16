import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { BlogRepositoryMongodb } from '../infrastructure/blog.repository.mongodb';
import { Blog } from '../models/blogs.schema';
import { randomUUID } from 'crypto';
import { BlogViewModel } from '../models/blog-view-model';

@Injectable()
export class BlogService {
  constructor(private readonly blogRepository: BlogRepositoryMongodb) {}

  async createNewBlog(
    name: string,
    youtubeUrl: string,
  ): Promise<BlogViewModel> {
    const newBlog: Blog = {
      id: randomUUID(),
      name,
      youtubeUrl,
    };
    const result = await this.blogRepository.createNewBlog({ ...newBlog });
    if (!result) throw new BadRequestException();
    return newBlog;
  }

  async updateOneBlogById(
    id: string,
    name: string,
    youtubeUrl: string,
  ): Promise<boolean> {
    const isUpdated = await this.blogRepository.updateOneBlogById(
      id,
      name,
      youtubeUrl,
    );
    if (!isUpdated) throw new NotFoundException();
    return true;
  }

  async deleteOneBlogById(id: string): Promise<boolean> {
    const isDeleted = await this.blogRepository.deleteOneBlogById(id);
    if (!isDeleted) throw new NotFoundException();
    return true;
  }
}
