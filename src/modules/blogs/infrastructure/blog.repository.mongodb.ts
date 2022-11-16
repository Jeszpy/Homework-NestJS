import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Blog, BlogDocument } from '../models/blogs.schema';
import { Model } from 'mongoose';
import { UpdateBlogDto } from '../dto/update-blog.dto';
import { BlogViewModel } from '../models/blog-view-model';

@Injectable()
export class BlogRepositoryMongodb {
  constructor(@InjectModel(Blog.name) private blogModel: Model<BlogDocument>) {}

  async createNewBlog(newBlog: Blog): Promise<BlogViewModel> {
    return this.blogModel.create(newBlog);
  }

  async getAllBlogs() {
    return `This action returns all blogs`;
  }

  async getOneBlogById(id: string) {
    return `This action returns a #${id} blog`;
  }

  async updateOneBlogById(id: string, updateBlogDto: UpdateBlogDto) {
    return `This action updates a #${id} blog`;
  }

  async deleteOneBlogById(id: string) {
    return `This action removes a #${id} blog`;
  }
}
