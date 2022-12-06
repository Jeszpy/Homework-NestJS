import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Blog, BlogDocument } from '../models/blog.schema';
import { Model } from 'mongoose';
import { BlogUpdateModel } from '../models/blog-update-model';
import { BlogViewModel } from '../models/blog-view-model';

@Injectable()
export class BlogRepositoryMongodb {
  constructor(@InjectModel(Blog.name) private blogModel: Model<BlogDocument>) {}

  async createNewBlog(newBlog: Blog): Promise<boolean> {
    try {
      await this.blogModel.create({ ...newBlog });
      return true;
    } catch (e) {
      return false;
    }
  }

  async updateOneBlogById(
    blogId: string,
    blogUpdateData: BlogUpdateModel,
  ): Promise<boolean> {
    try {
      return this.blogModel.findOneAndUpdate(
        { id: blogId },
        { $set: blogUpdateData },
      );
    } catch (e) {
      return false;
    }
  }

  async deleteOneBlogById(blogId: string): Promise<boolean> {
    try {
      return this.blogModel.findOneAndDelete({ id: blogId });
    } catch (e) {
      return false;
    }
  }
}
