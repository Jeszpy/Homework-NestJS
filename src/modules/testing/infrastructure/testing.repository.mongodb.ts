import { InjectModel } from '@nestjs/mongoose';
import { Video, VideoDocument } from '../../video/models/video.schema';
import mongoose from 'mongoose';
import { Injectable } from '@nestjs/common';

@Injectable()
export class TestingRepository {
  constructor(
    @InjectModel(Video.name)
    private readonly videoModel: mongoose.Model<VideoDocument>,
  ) {}

  async wipeAllData(): Promise<boolean> {
    try {
      await this.videoModel.deleteMany({});
      return true;
    } catch (e) {
      return false;
    }
  }
}
