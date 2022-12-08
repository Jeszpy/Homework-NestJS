import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UpdateCommentDto } from '../dto/update-comment.dto';
import { CommentRepositoryMongodb } from '../infrastructure/comment.repository.mongodb';
import { UserEntity } from '../../user/models/user.schema';
import { Comment } from '../models/comment.schema';
import { randomUUID } from 'crypto';
import { CommentViewModel } from '../models/comment-view-model';
import { CommentQueryRepositoryMongodb } from '../infrastructure/comment-query.repository.mongodb';

@Injectable()
export class CommentService {
  constructor(
    private readonly commentRepository: CommentRepositoryMongodb,
    private readonly commentQueryRepository: CommentQueryRepositoryMongodb,
  ) {}

  async createCommentByParentId(
    parentId: string,
    user: UserEntity,
    content: string,
  ): Promise<CommentViewModel> {
    const newComment: Comment = {
      id: randomUUID(),
      parentId,
      content,
      userId: user.id,
      userLogin: user.accountData.login,
      createdAt: new Date().toISOString(),
    };
    const result = await this.commentRepository.createComment(newComment);
    if (!result) throw new BadRequestException();
    return new CommentViewModel(
      newComment.id,
      newComment.content,
      newComment.userId,
      newComment.userLogin,
      newComment.createdAt,
    );
  }

  async updateCommentById(commentId: string, userId: string, content: string) {
    const comment = await this.commentQueryRepository.findCommentById(
      commentId,
    );
    if (!comment) throw new NotFoundException();
    if (comment.userId !== userId) throw new ForbiddenException();
    return this.commentRepository.updateCommentById(commentId, content);
  }

  async deleteCommentById(commentId: string, userId: string) {
    const comment = await this.commentQueryRepository.findCommentById(
      commentId,
    );
    if (!comment) throw new NotFoundException();
    if (comment.userId !== userId) throw new ForbiddenException();
    return this.commentRepository.deleteCommentById(commentId);
  }
}
