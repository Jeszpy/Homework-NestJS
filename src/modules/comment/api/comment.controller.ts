import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  Put,
  UseGuards,
} from '@nestjs/common';
import { CommentService } from '../application/comment.service';
import { UpdateCommentDto } from '../dto/update-comment.dto';
import { BearerAuthGuard } from '../../../guards/bearer-auth.guard';
import { UserEntity } from '../../user/models/user.schema';
import { User } from '../../../decorators/param/user.decorator';
import { CommentQueryRepositoryMongodb } from '../infrastructure/comment-query.repository.mongodb';
import { CommentViewModel } from '../models/comment-view-model';
import { SkipThrottle } from '@nestjs/throttler';
import { LikeStatusDto } from '../dto/like-status.dto';
import { GetUserIdFromBearerToken } from '../../../guards/get-userId-from-bearer-token';
import { UserId } from '../../../decorators/param/userId.decorator';

@SkipThrottle()
@Controller('comments')
export class CommentController {
  constructor(
    private readonly commentService: CommentService,
    private readonly commentQueryRepository: CommentQueryRepositoryMongodb,
  ) {}

  @UseGuards(GetUserIdFromBearerToken)
  @Get(':commentId')
  @HttpCode(200)
  async findCommentById(
    @Param('commentId') commentId: string,
    @UserId() userId: string | null,
  ): Promise<CommentViewModel> {
    const comment = await this.commentQueryRepository.findCommentById(
      commentId,
      userId,
    );
    if (!comment) throw new NotFoundException();
    return comment;
  }

  @UseGuards(BearerAuthGuard)
  @Put(':commentId')
  @HttpCode(204)
  async updateCommentById(
    @Param('commentId') commentId: string,
    @User() user: UserEntity,
    @Body() updateCommentDto: UpdateCommentDto,
  ) {
    return this.commentService.updateCommentById(
      commentId,
      user.id,
      updateCommentDto.content,
    );
  }

  @UseGuards(BearerAuthGuard)
  @Put(':commentId/like-status')
  @HttpCode(204)
  async changeReactionForComment(
    @Param('commentId') commentId: string,
    @User() user: UserEntity,
    @Body() likeStatusDto: LikeStatusDto,
  ) {
    return this.commentService.changeReactionForComment(
      commentId,
      user.id,
      user.accountData.login,
      likeStatusDto.likeStatus,
    );
  }

  @UseGuards(BearerAuthGuard)
  @Delete(':commentId')
  @HttpCode(204)
  async deleteCommentById(
    @Param('commentId') commentId: string,
    @User() user: UserEntity,
  ) {
    return this.commentService.deleteCommentById(commentId, user.id);
  }
}
