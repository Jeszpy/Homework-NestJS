import { InjectModel } from '@nestjs/mongoose';
import { Comment, CommentDocument } from '../models/comment.schema';
import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';

@Injectable()
export class CommentRepositoryMongodb {
  constructor(
    @InjectModel(Comment.name)
    private readonly commentModel: Model<CommentDocument>,
  ) {}

  async createComment(newComment: Comment): Promise<boolean> {
    try {
      await this.commentModel.create(newComment);
      return true;
    } catch (e) {
      return false;
    }
  }

  async updateCommentById(commentId: string, content: string) {
    return this.commentModel.findOneAndUpdate(
      { id: commentId },
      { $set: { content } },
    );
  }

  async deleteCommentById(commentId: string) {
    return this.commentModel.deleteOne({ id: commentId });
  }
}
