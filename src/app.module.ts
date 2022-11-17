import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { VideoModule } from './modules/video/video.module';
import { TestingModule } from './modules/testing/testing.module';
import { BlogModule } from './modules/blog/blogModule';
import { PostModule } from './modules/post/post.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGO_URI'),
      }),
      inject: [ConfigService],
    }),
    VideoModule,
    BlogModule,
    PostModule,
    TestingModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
