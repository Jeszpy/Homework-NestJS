import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { VideoService } from '../application/video.service';
import { VideoViewModel } from '../models/video-view-model';
import { CreateVideoDto } from '../dto/create-video.dto';
import { UpdateVideoDto } from '../dto/update-video.dto';
import { SkipThrottle } from '@nestjs/throttler';

@SkipThrottle()
@Controller('videos')
export class VideoController {
  constructor(private videoService: VideoService) {}

  @Get()
  async getAllVideos(): Promise<VideoViewModel[]> {
    return this.videoService.getAllVideos();
  }

  @Get('/:id')
  async getOneVideoById(@Param('id') id: number): Promise<VideoViewModel> {
    const video = await this.videoService.getOneVideoById(id);
    if (!video) throw new NotFoundException();
    return video;
  }

  @Post()
  async createVideo(
    @Body() createVideoDto: CreateVideoDto,
  ): Promise<VideoViewModel> {
    return this.videoService.createVideo(createVideoDto);
  }

  @Put('/:id')
  @HttpCode(204)
  async updateVideoById(
    @Param('id') id: number,
    @Body() updateVideoDto: UpdateVideoDto,
  ) {
    const isUpdated = await this.videoService.updateVideoById(
      id,
      updateVideoDto,
    );
    if (!isUpdated) throw new NotFoundException();
    return;
  }

  @Delete('/:id')
  @HttpCode(204)
  async deleteVideoById(@Param('id') id: number) {
    const isDeleted = await this.videoService.deleteVideoById(id);
    if (!isDeleted) throw new NotFoundException();
    return;
  }
}
