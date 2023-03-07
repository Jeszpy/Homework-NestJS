import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { MongooseModule } from '@nestjs/mongoose';
import configuration from './config/configuration';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { ScheduleModule } from '@nestjs/schedule';
import { AuthController } from './modules/auth/api/auth.controller';
import { JwtService } from './modules/auth/application/jwt.service';
import { UserQueryRepositoryMongodb } from './modules/user/infrastructure/user-query.repository.mongodb';
import { UserEntity, UserSchema } from './modules/user/models/user.schema';
import { AuthService } from './modules/auth/application/auth.service';
import { UserService } from './modules/user/application/user.service';
import { UserRepositoryMongodb } from './modules/user/infrastructure/user.repository.mongodb';
import { SessionService } from './modules/session/application/session.service';
import { SessionRepositoryMongodb } from './modules/session/infrastructure/session.repository.mongodb';
import { SessionQueryRepositoryMongodb } from './modules/session/infrastructure/session-query.repository.mongodb';
import { EmailService } from './modules/email/email.service';
import { MailerModule } from '@nestjs-modules/mailer';
import { Session, SessionSchema } from './modules/session/models/session.schema';
import { UserController } from './modules/user/api/user.controller';
import { VideoController } from './modules/video/api/video.controller';
import { VideoService } from './modules/video/application/video.service';
import { VideoRepositoryMongodb } from './modules/video/infrastructure/video.repository.mongodb';
import { Video, VideoSchema } from './modules/video/models/video.schema';
import { BlogController } from './modules/blog/api/blog.controller';
import { Blog, BlogSchema } from './modules/blog/models/blog.schema';
import { BlogService } from './modules/blog/application/blog.service';
import { BlogRepositoryMongodb } from './modules/blog/infrastructure/blog.repository.mongodb';
import { BlogQueryRepository } from './modules/blog/interfaces/IBlogQueryRepository';
import { PostService } from './modules/post/application/post.service';
import { PostRepositoryMongodb } from './modules/post/infrastructure/post.repository.mongodb';
import { PostQueryRepositoryMongodb } from './modules/post/infrastructure/post-query.repository.mongodb';
import { Post, PostSchema } from './modules/post/models/post.schema';
import { PostController } from './modules/post/api/post.controller';
import { CommentService } from './modules/comment/application/comment.service';
import { CommentRepositoryMongodb } from './modules/comment/infrastructure/comment.repository.mongodb';
import { CommentQueryRepositoryMongodb } from './modules/comment/infrastructure/comment-query.repository.mongodb';
import { Comment, CommentSchema } from './modules/comment/models/comment.schema';
import { ReactionService } from './modules/reaction/application/reaction.service';
import { ReactionRepositoryMongodb } from './modules/reaction/infrastructure/reaction.repository.mongodb';
import { Reaction, ReactionSchema } from './modules/reaction/models/reaction.schema';
import { CommentController } from './modules/comment/api/comment.controller';
import { SecurityController } from './modules/security/api/security.controller';
import { TestingController } from './modules/testing/api/testing.controller';
import { TestingService } from './modules/testing/application/testing.service';
import { TestingRepository } from './modules/testing/infrastructure/testing.repository.mongodb';
import { MongooseConfig } from './config/mongoose.config';
import { ThrottlerConfig } from './config/throttler.config';
import { MailerConfig } from './config/mailer.config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TypeOrmConfig } from './config/type-orm.config';
import { BlogExistsValidator } from './validators/blog-exists.validator';
import { UserLoginExistsValidator } from './validators/user-login-exists.validator';
import { UserEmailExistsValidator } from './validators/user-email-exists.validator';
import { BloggerController } from './modules/blogger/blogger.controller';
import { CqrsModule } from '@nestjs/cqrs';
import { QuizGameController } from './modules/games/quiz/api/quiz-game.controller';
import { QuizConnectionUseCase } from './modules/games/quiz/use-cases/quiz.connection.use-case';
import { QuizGame, QuizGameSchema } from './modules/games/quiz/models/quiz.schema';
import { QuizQuestion, QuizQuestionSchema } from './modules/games/quiz/models/quiz-question.schema';
import { QuizCreateNewQuestionUseCase } from './modules/games/quiz/use-cases/quiz.create-new-question.use-case';
import { QuizGetAllQuestionsUseCase } from './modules/games/quiz/use-cases/quiz.get-all-quiestions';
import { APP_GUARD } from '@nestjs/core';

const controllers = [
  AppController,
  AuthController,
  UserController,
  VideoController,
  BloggerController,
  BlogController,
  PostController,
  CommentController,
  SecurityController,
  QuizGameController,
  TestingController,
];

const guards = [{ provide: APP_GUARD, useClass: ThrottlerGuard }];

const validators = [UserLoginExistsValidator, UserEmailExistsValidator, BlogExistsValidator];

const services = [
  AuthService,
  UserService,
  EmailService,
  JwtService,
  SessionService,
  VideoRepositoryMongodb,
  VideoService,
  BlogService,
  PostService,
  CommentService,
  ReactionService,
  TestingService,
];

const quizUseCases = [QuizConnectionUseCase, QuizCreateNewQuestionUseCase, QuizGetAllQuestionsUseCase];

const useCases = [...quizUseCases];

const queryRepositories = [
  UserQueryRepositoryMongodb,
  SessionQueryRepositoryMongodb,
  BlogQueryRepository(),
  PostQueryRepositoryMongodb,
  CommentQueryRepositoryMongodb,
];

const repositories = [
  UserRepositoryMongodb,
  SessionRepositoryMongodb,
  BlogRepositoryMongodb,
  PostRepositoryMongodb,
  CommentRepositoryMongodb,
  ReactionRepositoryMongodb,
  TestingRepository,
  ...queryRepositories,
];

const mongooseModels = [
  { name: UserEntity.name, schema: UserSchema },
  { name: Session.name, schema: SessionSchema },
  { name: Video.name, schema: VideoSchema },
  { name: Blog.name, schema: BlogSchema },
  { name: Post.name, schema: PostSchema },
  { name: Comment.name, schema: CommentSchema },
  { name: Reaction.name, schema: ReactionSchema },
  { name: QuizGame.name, schema: QuizGameSchema },
  { name: QuizQuestion.name, schema: QuizQuestionSchema },
];

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [configuration] }),
    MongooseModule.forRootAsync({ useClass: MongooseConfig }),
    MongooseModule.forFeature(mongooseModels),
    TypeOrmModule.forRootAsync({ useClass: TypeOrmConfig }),
    CqrsModule,
    ScheduleModule.forRoot(),
    ThrottlerModule.forRootAsync({ useClass: ThrottlerConfig }),
    MailerModule.forRootAsync({ useClass: MailerConfig }),
  ],
  controllers,
  providers: [...guards, ...validators, ...services, ...useCases, ...repositories],
})
export class AppModule {}
