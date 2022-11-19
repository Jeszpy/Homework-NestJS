import { InjectModel } from '@nestjs/mongoose';
import { Post, PostDocument } from '../models/post.schema';
import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';

@Injectable()
export class PostRepositoryMongodb {
  constructor(
    @InjectModel(Post.name) private readonly postModel: Model<PostDocument>,
  ) {}
  async createNewPost(newPost: Post): Promise<boolean> {
    try {
      await this.postModel.create(newPost);
      return true;
    } catch (e) {
      return false;
    }
  }

  async updateOnePostById(id: string, postForUpdate: Post) {
    try {
      const result = await this.postModel.updateOne(
        { id },
        { $set: postForUpdate },
      );
      return result.matchedCount === 1;
    } catch (e) {
      return false;
    }
  }

  async deleteOnePostById(id: string): Promise<boolean> {
    try {
      const result = await this.postModel.deleteOne({ id });
      return result.deletedCount === 1;
    } catch (e) {
      return false;
    }
  }

  async deletePostsByBlogId(blogId: string): Promise<boolean> {
    try {
      await this.postModel.deleteMany({ blogId });
      return true;
    } catch (e) {
      return false;
    }
  }

  async updateBlogNameForPosts(
    blogId: string,
    blogName: string,
  ): Promise<boolean> {
    try {
      await this.postModel.updateMany({ blogId }, { $set: { blogName } });
      return true;
    } catch (e) {
      return false;
    }
  }
}
