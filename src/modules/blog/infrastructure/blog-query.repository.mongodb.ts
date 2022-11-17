import { BlogViewModel } from '../models/blog-view-model';
import { InjectModel } from '@nestjs/mongoose';
import { Blog, BlogDocument } from '../models/blogs.schema';
import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { IBlogQueryRepository } from '../interfaces/IBlogQueryRepository';

@Injectable()
export class BlogQueryRepositoryMongodb implements IBlogQueryRepository {
  constructor(@InjectModel(Blog.name) private blogModel: Model<BlogDocument>) {}
  async getAllBlogs(): Promise<BlogViewModel[]> {
    return this.blogModel.find({}, { _id: false }).lean();
  }

  async getOneBlogById(id: string): Promise<BlogViewModel | null> {
    const blog = await this.blogModel.findOne({ id }, { _id: false });
    if (!blog) return null;
    return blog;
  }
}
