import { InjectModel } from '@nestjs/mongoose';
import { Comment, CommentDocument } from '../models/comment.schema';
import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { CommentViewModel } from '../models/comment-view-model';
import { CommentPaginationQueryDto } from '../../../helpers/pagination/dto/comment-pagination-query.dto';
import { PaginationViewModel } from '../../../helpers/pagination/pagination-view-model.mapper';

@Injectable()
export class CommentQueryRepositoryMongodb {
  constructor(
    @InjectModel(Comment.name)
    private readonly commentModel: Model<CommentDocument>,
  ) {}

  async findCommentById(commentId: string): Promise<CommentViewModel | null> {
    return this.commentModel.findOne(
      { id: commentId },
      { _id: false, parentId: false },
    );
  }

  async findCommentsByParentId(
    parentId: string,
    commentPaginationQueryDto: CommentPaginationQueryDto,
  ): Promise<PaginationViewModel<CommentViewModel[]>> {
    const comments = await this.commentModel
      .find({ parentId }, { _id: false, parentId: false })
      .skip(
        (commentPaginationQueryDto.pageNumber - 1) *
          commentPaginationQueryDto.pageSize,
      )
      .limit(commentPaginationQueryDto.pageSize)
      .sort({
        [commentPaginationQueryDto.sortBy]:
          commentPaginationQueryDto.sortDirection === 'asc' ? 1 : -1,
      })
      .lean();
    const totalCount = await this.commentModel.countDocuments({ parentId });
    return new PaginationViewModel(
      totalCount,
      commentPaginationQueryDto.pageNumber,
      commentPaginationQueryDto.pageSize,
      comments,
    );
  }
}
