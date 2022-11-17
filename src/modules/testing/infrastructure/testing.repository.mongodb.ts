import { InjectModel } from '@nestjs/mongoose';
import { Video, VideoDocument } from '../../video/models/video.schema';
import mongoose, { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { Blog, BlogDocument } from '../../blog/models/blogs.schema';

@Injectable()
export class TestingRepository {
  constructor(
    @InjectModel(Video.name)
    private readonly videoModel: mongoose.Model<VideoDocument>,
    @InjectModel(Blog.name) private readonly blogModel: Model<BlogDocument>,
  ) {}

  async wipeAllData(): Promise<boolean> {
    try {
      await this.videoModel.deleteMany({});
      await this.blogModel.deleteMany({});
      return true;
    } catch (e) {
      return false;
    }
  }
}
