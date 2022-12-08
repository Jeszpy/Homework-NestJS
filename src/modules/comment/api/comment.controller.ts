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

@Controller('comments')
export class CommentController {
  constructor(
    private readonly commentService: CommentService,
    private readonly commentQueryRepository: CommentQueryRepositoryMongodb,
  ) {}

  @Get(':commentId')
  @HttpCode(200)
  async findCommentById(
    @Param('commentId') commentId: string,
  ): Promise<CommentViewModel> {
    const comment = await this.commentQueryRepository.findCommentById(
      commentId,
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
  @Delete(':commentId')
  @HttpCode(204)
  async deleteCommentById(
    @Param('commentId') commentId: string,
    @User() user: UserEntity,
  ) {
    return this.commentService.deleteCommentById(commentId, user.id);
  }
}
