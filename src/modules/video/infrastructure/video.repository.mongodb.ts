import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Video, VideoDocument } from '../models/video.schema';
import mongoose from 'mongoose';
import { VideoViewModel } from '../models/video-view-model';
import { UpdateVideoDto } from '../dto/update-video.dto';

@Injectable()
export class VideoRepositoryMongodb {
  constructor(
    @InjectModel(Video.name)
    private videoModel: mongoose.Model<VideoDocument>,
  ) {}

  async getAllVideos(): Promise<VideoViewModel[]> {
    return this.videoModel.find({}, { _id: false }).lean();
  }

  async createVideo(newVideo: Video): Promise<VideoViewModel> {
    return this.videoModel.create(newVideo);
  }

  async getOneVideoById(id: number): Promise<VideoViewModel> {
    return this.videoModel.findOne({ id: id }, { _id: false });
  }

  async updateVideoById(
    id: number,
    updateVideoDto: UpdateVideoDto,
  ): Promise<boolean> {
    try {
      const result = await this.videoModel.updateOne(
        { id },
        {
          $set: {
            title: updateVideoDto.title,
            author: updateVideoDto.author,
            canBeDownloaded: updateVideoDto.canBeDownloaded,
            minAgeRestriction: updateVideoDto.minAgeRestriction,
            publicationDate: updateVideoDto.publicationDate,
            availableResolutions: updateVideoDto.availableResolutions,
          },
        },
      );
      return result.matchedCount === 1;
    } catch (e) {
      return false;
    }
  }

  async deleteVideoById(id: number): Promise<boolean> {
    try {
      const result = await this.videoModel.deleteOne({ id });
      return result.deletedCount === 1;
    } catch (e) {
      return false;
    }
  }
}
