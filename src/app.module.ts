import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { VideoModule } from './modules/video/video.module';
import { TestingModule } from './modules/testing/testing.module';
import { BlogModule } from './modules/blog/blog.module';
import { PostModule } from './modules/post/post.module';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { UserModule } from './modules/user/user.module';
import { AuthModule } from './modules/auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    // ThrottlerModule.forRootAsync({
    //   imports: [ConfigModule],
    //   inject: [ConfigService],
    //   useFactory: (configService: ConfigService) => {
    //     const ttl = parseInt(configService.get('THROTTLE_TTL'), 10);
    //     const limit = parseInt(configService.get('THROTTLE_LIMIT'), 10);
    //     return {
    //       ttl,
    //       limit,
    //     };
    //   },
    // }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const uri = configService.get<string>('MONGO_URI');
        return {
          uri,
        };
      },
    }),
    AuthModule,
    UserModule,
    VideoModule,
    BlogModule,
    PostModule,
    TestingModule,
  ],
  controllers: [AppController],
  // providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
