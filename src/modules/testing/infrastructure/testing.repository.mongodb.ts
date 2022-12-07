import { InjectModel } from '@nestjs/mongoose';
import { Video, VideoDocument } from '../../video/models/video.schema';
import mongoose, { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { Blog, BlogDocument } from '../../blog/models/blog.schema';
import { Post, PostDocument } from '../../post/models/post.schema';
import { UserEntity, UserDocument } from '../../user/models/user.schema';

@Injectable()
export class TestingRepository {
  constructor(
    @InjectModel(Video.name)
    private readonly videoModel: mongoose.Model<VideoDocument>,
    @InjectModel(Blog.name) private readonly blogModel: Model<BlogDocument>,
    @InjectModel(Post.name) private readonly postModel: Model<PostDocument>,
    @InjectModel(UserEntity.name)
    private readonly userModel: Model<UserDocument>,
  ) {}

  async wipeAllData(): Promise<boolean> {
    try {
      await this.videoModel.deleteMany({});
      await this.blogModel.deleteMany({});
      await this.postModel.deleteMany({});
      await this.userModel.deleteMany({});
      return true;
    } catch (e) {
      return false;
    }
  }
}
