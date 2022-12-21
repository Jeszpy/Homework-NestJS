import { InjectModel } from '@nestjs/mongoose';
import { Comment, CommentDocument } from '../models/comment.schema';
import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { CommentViewModel } from '../models/comment-view-model';
import { CommentPaginationQueryDto } from '../../../helpers/pagination/dto/comment-pagination-query.dto';
import { PaginationViewModel } from '../../../helpers/pagination/pagination-view-model.mapper';
import {
  Reaction,
  ReactionDocument,
} from '../../reaction/models/reaction.schema';

@Injectable()
export class CommentQueryRepositoryMongodb {
  constructor(
    @InjectModel(Comment.name)
    private readonly commentModel: Model<CommentDocument>,
    @InjectModel(Reaction.name)
    private readonly rtModel: Model<ReactionDocument>,
  ) {}

  async findCommentById(
    commentId: string,
    userId?: string,
  ): Promise<CommentViewModel | null> {
    const result = await this.commentModel.aggregate([
      { $match: { id: commentId } },
      {
        $lookup: {
          from: 'reactions',
          localField: 'id',
          foreignField: 'parentId',
          pipeline: [
            {
              $match: {
                status: 'Like',
              },
            },
            { $count: 'count' },
          ],
          as: 'likesCount',
        },
      },
      {
        $lookup: {
          from: 'reactions',
          localField: 'id',
          foreignField: 'parentId',
          pipeline: [
            {
              $match: {
                status: 'Dislike',
              },
            },
            { $count: 'count' },
          ],
          as: 'dislikesCount',
        },
      },
      {
        $lookup: {
          from: 'reactions',
          localField: 'id',
          foreignField: 'parentId',
          pipeline: [
            {
              $match: { userId: userId ?? '' },
            },
            {
              $project: { _id: 0, reactionStatus: 1 },
            },
          ],
          as: 'myStatus',
        },
      },
      {
        $project: {
          _id: 0,
          id: 1,
          content: 1,
          userId: 1,
          userLogin: 1,
          createdAt: 1,
          'likesInfo.likesCount': { $size: '$likesCount' },
          'likesInfo.dislikesCount': { $size: '$dislikesCount' },
          'likesInfo.myStatus': {
            $cond: {
              if: { $eq: [{ $size: '$myStatus' }, 0] },
              then: 'None',
              else: '$myStatus.reactionStatus',
            },
          },
        },
      },
      { $unwind: '$likesInfo.myStatus' },
    ]);
    return result[0];
  }

  async findCommentsByParentId(
    parentId: string,
    commentPaginationQueryDto: CommentPaginationQueryDto,
    userId: string | null,
  ): Promise<PaginationViewModel<CommentViewModel[]>> {
    const comments = await this.commentModel.aggregate([
      { $match: { parentId } },
      {
        $lookup: {
          from: 'reactions',
          localField: 'id',
          foreignField: 'parentId',
          pipeline: [
            {
              $match: {
                status: 'Like',
              },
            },
            { $count: 'count' },
          ],
          as: 'likesCount',
        },
      },
      {
        $lookup: {
          from: 'reactions',
          localField: 'id',
          foreignField: 'parentId',
          pipeline: [
            {
              $match: {
                status: 'Dislike',
              },
            },
            { $count: 'count' },
          ],
          as: 'dislikesCount',
        },
      },
      {
        $lookup: {
          from: 'reactions',
          localField: 'id',
          foreignField: 'parentId',
          pipeline: [
            {
              $match: { userId: userId ?? '' },
            },
            {
              $project: { _id: 0, reactionStatus: 1 },
            },
          ],
          as: 'myStatus',
        },
      },
      {
        $project: {
          _id: 0,
          id: 1,
          content: 1,
          userId: 1,
          userLogin: 1,
          createdAt: 1,
          'likesInfo.likesCount': { $size: '$likesCount' },
          'likesInfo.dislikesCount': { $size: '$dislikesCount' },
          'likesInfo.myStatus': {
            $cond: {
              if: { $eq: [{ $size: '$myStatus' }, 0] },
              then: 'None',
              else: '$myStatus.reactionStatus',
            },
          },
        },
      },
      { $unwind: '$likesInfo.myStatus' },
    ]);
    const totalCount = await this.commentModel.countDocuments({ parentId });
    return new PaginationViewModel(
      totalCount,
      commentPaginationQueryDto.pageNumber,
      commentPaginationQueryDto.pageSize,
      comments,
    );
  }
}
