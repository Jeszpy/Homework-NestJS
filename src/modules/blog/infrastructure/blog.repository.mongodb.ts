import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Blog, BlogDocument } from '../models/blogs.schema';
import { Model } from 'mongoose';

@Injectable()
export class BlogRepositoryMongodb {
  constructor(@InjectModel(Blog.name) private blogModel: Model<BlogDocument>) {}

  async createNewBlog(newBlog: Blog): Promise<boolean> {
    try {
      await this.blogModel.create(newBlog);
      return true;
    } catch (e) {
      return false;
    }
  }

  async updateOneBlogById(
    id: string,
    name: string,
    youtubeUrl: string,
  ): Promise<boolean> {
    try {
      const result = await this.blogModel.updateOne(
        { id },
        { $set: { name, youtubeUrl } },
      );
      return result.matchedCount === 1;
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
