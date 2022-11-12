import { Module } from '@nestjs/common';
import { VideoController } from './api/video.controller';
import { VideoService } from './application/video.service';
import { VideoRepositoryMongodb } from './infrastructure/video.repository.mongodb';
import { MongooseModule } from '@nestjs/mongoose';
import { Video, VideoSchema } from './models/video.schema';

const schemas = [{ name: Video.name, schema: VideoSchema }];

@Module({
  imports: [MongooseModule.forFeature(schemas)],
  controllers: [VideoController],
  providers: [VideoService, VideoRepositoryMongodb],
})
export class VideoModule {}
