import { InjectModel } from '@nestjs/mongoose';
import { Video, VideoDocument } from '../../video/models/video.schema';
import mongoose, { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { Blog, BlogDocument } from '../../blog/models/blog.schema';
import { Post, PostDocument } from '../../post/models/post.schema';
import { UserEntity, UserDocument } from '../../user/models/user.schema';
import { Comment, CommentDocument } from '../../comment/models/comment.schema';
import { Session, SessionDocument } from '../../session/models/session.schema';
import {
  Reaction,
  ReactionDocument,
} from '../../reaction/models/reaction.schema';

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
      return true;
    } catch (e) {
      return false;
    }
  }
}
