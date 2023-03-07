import { InjectModel } from '@nestjs/mongoose';
import { Video, VideoDocument } from '../../video/models/video.schema';
import mongoose, { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { Blog, BlogDocument } from '../../blog/models/blog.schema';
import { Post, PostDocument } from '../../post/models/post.schema';
import { UserEntity, UserDocument } from '../../user/models/user.schema';
import { Comment, CommentDocument } from '../../comment/models/comment.schema';
import { Session, SessionDocument } from '../../session/models/session.schema';
import { Reaction, ReactionDocument } from '../../reaction/models/reaction.schema';
import { QuizGame, QuizGameDocument } from '../../games/quiz/models/quiz.schema';
import { QuizQuestion, QuizQuestionDocument } from '../../games/quiz/models/quiz-question.schema';

@Injectable()
export class TestingRepository {
  constructor(
    @InjectModel(UserEntity.name)
    private readonly userModel: Model<UserDocument>,
    @InjectModel(Video.name)
    private readonly videoModel: mongoose.Model<VideoDocument>,
    @InjectModel(Blog.name) private readonly blogModel: Model<BlogDocument>,
    @InjectModel(Post.name) private readonly postModel: Model<PostDocument>,
    @InjectModel(Comment.name)
    private readonly commentModel: Model<CommentDocument>,
    @InjectModel(Session.name)
    private readonly sessionModel: Model<SessionDocument>,
    @InjectModel(Reaction.name)
    private readonly reactionModel: Model<ReactionDocument>,
    @InjectModel(QuizGame.name) private readonly quizGameModel: Model<QuizGameDocument>,
    @InjectModel(QuizQuestion.name) private readonly quizQuestionModel: Model<QuizQuestionDocument>,
  ) {}

  async wipeAllData(): Promise<boolean> {
    try {
      await this.userModel.deleteMany({});
      await this.sessionModel.deleteMany({});
      await this.videoModel.deleteMany({});
      await this.blogModel.deleteMany({});
      await this.postModel.deleteMany({});
      await this.commentModel.deleteMany({});
      await this.reactionModel.deleteMany({});
      await this.quizGameModel.deleteMany({});
      await this.quizQuestionModel.deleteMany({});
      return true;
    } catch (e) {
      return false;
    }
  }

  async getAllReactions() {
    return this.reactionModel.find();
  }

  async getAllComments() {
    return this.commentModel.find();
  }

  async getCountOfAllElementsInDb(): Promise<number> {
    const u = await this.userModel.countDocuments();
    const s = await this.sessionModel.countDocuments();
    const v = await this.videoModel.countDocuments();
    const b = await this.blogModel.countDocuments();
    const p = await this.postModel.countDocuments();
    const c = await this.commentModel.countDocuments();
    const r = await this.reactionModel.countDocuments();
    return u + s + v + b + p + c + r;
  }
}
