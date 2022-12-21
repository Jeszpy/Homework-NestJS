import { Module } from '@nestjs/common';
import { TestingService } from './application/testing.service';
import { TestingController } from './api/testing.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Video, VideoSchema } from '../video/models/video.schema';
import { TestingRepository } from './infrastructure/testing.repository.mongodb';
import { Blog, BlogSchema } from '../blog/models/blog.schema';
import { Post, PostSchema } from '../post/models/post.schema';
import { UserEntity, UserSchema } from '../user/models/user.schema';
import { Comment, CommentSchema } from '../comment/models/comment.schema';
import { Session, SessionSchema } from '../session/models/session.schema';
import { Reaction, ReactionSchema } from '../reaction/models/reaction.schema';

const schemas = [
  { name: UserEntity.name, schema: UserSchema },
  { name: Video.name, schema: VideoSchema },
  { name: Blog.name, schema: BlogSchema },
  { name: Post.name, schema: PostSchema },
  { name: Comment.name, schema: CommentSchema },
  { name: Session.name, schema: SessionSchema },
  { name: Reaction.name, schema: ReactionSchema },
];

@Module({
  imports: [MongooseModule.forFeature(schemas)],
  controllers: [TestingController],
  providers: [TestingService, TestingRepository],
})
export class TestingModule {}
