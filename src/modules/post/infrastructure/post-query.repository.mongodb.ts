import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Post, PostDocument } from '../models/post.schema';
import { Model } from 'mongoose';
import { PostViewModel } from '../models/post-view-model';

@Injectable()
export class PostQueryRepositoryMongodb {
  constructor(
    @InjectModel(Post.name) private readonly postModel: Model<PostDocument>,
  ) {}
  async getAllPosts(): Promise<PostViewModel[]> {
    return this.postModel.find({}, { _id: false }).lean();
  }

  async getOnePostById(postId: string): Promise<PostViewModel | null> {
    return this.postModel.findOne({ id: postId }, { _id: false });
  }

  async getAllPostsByBlogId(blogId: string): Promise<PostViewModel[]> {
    return this.postModel.find({ blogId }, { _id: false }).lean();
  }
}
