import { InjectModel } from '@nestjs/mongoose';
import { Post, PostDocument } from '../models/post.schema';
import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { PostUpdateModel } from '../models/post-update-model';

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

  async updateOnePostById(
    id: string,
    postForUpdate: PostUpdateModel,
  ): Promise<boolean> {
    try {
      return this.postModel.findOneAndUpdate({ id }, { $set: postForUpdate });
    } catch (e) {
      return false;
    }
  }

  async deleteOnePostById(postId: string): Promise<boolean> {
    try {
      return this.postModel.findOneAndDelete({ id: postId });
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
