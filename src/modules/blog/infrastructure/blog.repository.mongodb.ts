import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Blog, BlogDocument } from '../models/blogs.schema';
import { Model } from 'mongoose';

@Injectable()
export class BlogRepositoryMongodb {
  constructor(@InjectModel(Blog.name) private blogModel: Model<BlogDocument>) {}

  async createNewBlog(newBlog: Blog): Promise<boolean | Blog> {
    try {
      await this.blogModel.create({ ...newBlog });
      return newBlog;
    } catch (e) {
      console.log(e);
      return false;
    }
  }

  async updateOneBlogById(blogUpdateData: Blog): Promise<boolean> {
    try {
      const result = await this.blogModel.findOneAndUpdate(
        { id: blogUpdateData.id },
        { $set: blogUpdateData },
      );
      return !!result;
    } catch (e) {
      return false;
    }
  }

  async deleteOneBlogById(id: string): Promise<boolean> {
    try {
      const result = await this.blogModel.deleteOne({ id });
      return result.deletedCount === 1;
    } catch (e) {
      return false;
    }
  }
}
