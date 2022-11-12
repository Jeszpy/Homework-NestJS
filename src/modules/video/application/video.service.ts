import { Injectable } from '@nestjs/common';
import { Video } from '../models/video.schema';
import { VideoRepositoryMongodb } from '../infrastructure/video.repository.mongodb';
import { VideoViewModel } from '../models/video-view-model';
import { CreateVideoDto } from '../dto/create-video.dto';
import { addDays } from 'date-fns';
import { UpdateVideoDto } from '../dto/update-video.dto';

@Injectable()
export class VideoService {
  constructor(private readonly videoRepository: VideoRepositoryMongodb) {}
  async getAllVideos(): Promise<VideoViewModel[]> {
    return this.videoRepository.getAllVideos();
  }
  async createVideo(createVideoDto: CreateVideoDto): Promise<VideoViewModel> {
    const dateNow = new Date();
    const newVideo: Video = {
      id: +dateNow,
      title: createVideoDto.title,
      author: createVideoDto.author,
      canBeDownloaded: false,
      minAgeRestriction: null,
      createdAt: dateNow.toISOString(),
      publicationDate: addDays(dateNow, 1).toISOString(),
      availableResolutions: createVideoDto.availableResolutions,
    };
    await this.videoRepository.createVideo(newVideo);
    return newVideo;
  }

  async getOneVideoById(id: number): Promise<VideoViewModel> {
    return this.videoRepository.getOneVideoById(id);
  }

  async updateVideoById(id: number, updateVideoDto: UpdateVideoDto) {
    return this.videoRepository.updateVideoById(id, updateVideoDto);
  }

  async deleteVideoById(id: number) {
    return this.videoRepository.deleteVideoById(id);
  }
}
