import { Module } from '@nestjs/common';
import { TestingService } from './application/testing.service';
import { TestingController } from './api/testing.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Video, VideoSchema } from '../video/models/video.schema';
import { TestingRepository } from './infastructure/testing.repository.mongodb';

const schemas = [{ name: Video.name, schema: VideoSchema }];

@Module({
  imports: [MongooseModule.forFeature(schemas)],
  controllers: [TestingController],
  providers: [TestingService, TestingRepository],
})
export class TestingModule {}
