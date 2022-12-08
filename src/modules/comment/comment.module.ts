import { Module } from '@nestjs/common';
import { CommentService } from './application/comment.service';
import { CommentController } from './api/comment.controller';
import { JwtService } from '../auth/application/jwt.service';
import { UserQueryRepositoryMongodb } from '../user/infrastructure/user-query.repository.mongodb';
import { MongooseModule } from '@nestjs/mongoose';
import { UserEntity, UserSchema } from '../user/models/user.schema';
import { Post, PostSchema } from '../post/models/post.schema';
import { Comment, CommentSchema } from './models/comment.schema';
import { CommentRepositoryMongodb } from './infrastructure/comment.repository.mongodb';
import { CommentQueryRepositoryMongodb } from './infrastructure/comment-query.repository.mongodb';

const schemas = [
  { name: UserEntity.name, schema: UserSchema },
  { name: Post.name, schema: PostSchema },
  { name: Comment.name, schema: CommentSchema },
];

@Module({
  imports: [MongooseModule.forFeature(schemas)],
  controllers: [CommentController],
  //TODO: как избавиться от лишних провайдеров? они нкжны для BearerAuthGuard
  providers: [
    CommentService,
    JwtService,
    UserQueryRepositoryMongodb,
    CommentRepositoryMongodb,
    CommentQueryRepositoryMongodb,
  ],
})
export class CommentModule {}