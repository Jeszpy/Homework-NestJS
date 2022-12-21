import { Module } from '@nestjs/common';
import { PostService } from './application/post.service';
import { PostController } from './api/post.controller';
import { PostRepositoryMongodb } from './infrastructure/post.repository.mongodb';
import { PostQueryRepositoryMongodb } from './infrastructure/post-query.repository.mongodb';
import { MongooseModule } from '@nestjs/mongoose';
import { Post, PostSchema } from './models/post.schema';
import { Blog, BlogSchema } from '../blog/models/blog.schema';
import { BlogQueryRepository } from '../blog/interfaces/IBlogQueryRepository';
import { BlogExistsValidator } from '../../validators/blog-exists.validator';
import { UserQueryRepositoryMongodb } from '../user/infrastructure/user-query.repository.mongodb';
import { JwtService } from '../auth/application/jwt.service';
import { UserEntity, UserSchema } from '../user/models/user.schema';
import { CommentService } from '../comment/application/comment.service';
import { CommentQueryRepositoryMongodb } from '../comment/infrastructure/comment-query.repository.mongodb';
import { CommentRepositoryMongodb } from '../comment/infrastructure/comment.repository.mongodb';
import { Comment, CommentSchema } from '../comment/models/comment.schema';
import { AuthModule } from '../auth/auth.module';
import { ReactionService } from '../reaction/application/reaction.service';
import { Reaction, ReactionSchema } from '../reaction/models/reaction.schema';
import { ReactionRepositoryMongodb } from '../reaction/infrastructure/reaction.repository.mongodb';

const schemas = [
  { name: Blog.name, schema: BlogSchema },
  { name: Post.name, schema: PostSchema },
  { name: UserEntity.name, schema: UserSchema },
  { name: Comment.name, schema: CommentSchema },
  { name: Reaction.name, schema: ReactionSchema },
];

@Module({
  imports: [MongooseModule.forFeature(schemas)],
  controllers: [PostController],
  providers: [
    PostService,
    PostRepositoryMongodb,
    PostQueryRepositoryMongodb,
    BlogQueryRepository(),
    BlogExistsValidator,
    UserQueryRepositoryMongodb,
    JwtService,
    CommentService,
    CommentRepositoryMongodb,
    CommentQueryRepositoryMongodb,
    ReactionService,
    ReactionRepositoryMongodb,
  ],
})
export class PostModule {}
