import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CommentRepositoryMongodb } from '../infrastructure/comment.repository.mongodb';
import { UserEntity } from '../../user/models/user.schema';
import { Comment } from '../models/comment.schema';
import { randomUUID } from 'crypto';
import { CommentViewModel } from '../models/comment-view-model';
import { CommentQueryRepositoryMongodb } from '../infrastructure/comment-query.repository.mongodb';
import { ReactionStatusEnum } from '../../reaction/models/reaction.schema';
import { ReactionService } from '../../reaction/application/reaction.service';

@Injectable()
export class CommentService {
  constructor(
    private readonly commentRepository: CommentRepositoryMongodb,
    private readonly commentQueryRepository: CommentQueryRepositoryMongodb,
    private readonly likeService: ReactionService,
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
      likesInfo: {
        likesCount: 0,
        dislikesCount: 0,
        myStatus: ReactionStatusEnum.None,
      },
    };
    const result = await this.commentRepository.createComment(newComment);
    if (!result) throw new BadRequestException();
    return new CommentViewModel(
      newComment.id,
      newComment.content,
      newComment.userId,
      newComment.userLogin,
      newComment.createdAt,
      newComment.likesInfo,
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

  async changeReactionForComment(
    commentId: string,
    userId: string,
    userLogin: string,
    likeStatus: ReactionStatusEnum,
  ) {
    const comment = await this.commentQueryRepository.findCommentById(
      commentId,
      userId,
    );
    if (!comment) throw new NotFoundException();
    return this.likeService.updateReactionByParentId(
      commentId,
      userId,
      userLogin,
      likeStatus,
    );
  }
}
