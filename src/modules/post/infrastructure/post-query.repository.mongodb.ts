import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Post, PostDocument } from '../models/post.schema';
import { Model } from 'mongoose';
import { PostViewModel } from '../models/post-view-model';
import { PostPaginationQueryDto } from '../../../helpers/pagination/dto/post-pagination-query.dto';
import { PaginationViewModel } from '../../../helpers/pagination/pagination-view-model.mapper';

@Injectable()
export class PostQueryRepositoryMongodb {
  constructor(
    @InjectModel(Post.name) private readonly postModel: Model<PostDocument>,
  ) {}
  async getAllPosts(
    postPaginationQueryDto: PostPaginationQueryDto,
    userId: string | null,
  ): Promise<PaginationViewModel<PostViewModel[]>> {
    const posts = await this.postModel.aggregate([
      {
        $sort: {
          [postPaginationQueryDto.sortBy]:
            postPaginationQueryDto.sortDirection === 'asc' ? 1 : -1,
        },
      },
      {
        $skip:
          (postPaginationQueryDto.pageNumber - 1) *
          postPaginationQueryDto.pageSize,
      },
      { $limit: postPaginationQueryDto.pageSize },
      {
        $lookup: {
          from: 'reactions',
          localField: 'id',
          foreignField: 'parentId',
          pipeline: [
            {
              $match: {
                reactionStatus: 'Like',
                isUserBanned: false,
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
                reactionStatus: 'Dislike',
                isUserBanned: false,
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
        $lookup: {
          from: 'reactions',
          localField: 'id',
          foreignField: 'parentId',
          pipeline: [
            {
              $match: {
                reactionStatus: 'Like',
                isUserBanned: false,
              },
            },
            { $sort: { addedAt: -1 } },
            { $limit: 3 },
            {
              $project: { _id: 0, addedAt: 1, userId: 1, login: '$userLogin' },
            },
          ],
          as: 'newestLikes',
        },
      },
      {
        $project: {
          _id: 0,
          id: 1,
          title: 1,
          shortDescription: 1,
          content: 1,
          blogId: 1,
          blogName: 1,
          createdAt: 1,
          'extendedLikesInfo.likesCount': {
            $cond: {
              if: { $eq: [{ $size: '$likesCount' }, 0] },
              then: 0,
              else: '$likesCount.count',
            },
          },
          'extendedLikesInfo.dislikesCount': {
            $cond: {
              if: { $eq: [{ $size: '$dislikesCount' }, 0] },
              then: 0,
              else: '$dislikesCount.count',
            },
          },
          'extendedLikesInfo.myStatus': {
            $cond: {
              if: { $eq: [{ $size: '$myStatus' }, 0] },
              then: 'None',
              else: '$myStatus.reactionStatus',
            },
          },
          'extendedLikesInfo.newestLikes': '$newestLikes',
        },
      },
      { $unwind: '$extendedLikesInfo.likesCount' },
      { $unwind: '$extendedLikesInfo.dislikesCount' },
      { $unwind: '$extendedLikesInfo.myStatus' },
    ]);
    const totalCount = await this.postModel.countDocuments({});
    return new PaginationViewModel(
      totalCount,
      postPaginationQueryDto.pageNumber,
      postPaginationQueryDto.pageSize,
      posts,
    );
  }

  async getOnePostById(
    postId: string,
    userId: string | null,
  ): Promise<PostViewModel | null> {
    const result = await this.postModel.aggregate([
      { $match: { id: postId } },
      {
        $lookup: {
          from: 'reactions',
          localField: 'id',
          foreignField: 'parentId',
          pipeline: [
            {
              $match: {
                reactionStatus: 'Like',
                isUserBanned: false,
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
                reactionStatus: 'Dislike',
                isUserBanned: false,
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
        $lookup: {
          from: 'reactions',
          localField: 'id',
          foreignField: 'parentId',
          pipeline: [
            {
              $match: {
                reactionStatus: 'Like',
                isUserBanned: false,
              },
            },
            { $sort: { addedAt: -1 } },
            { $limit: 3 },
            {
              $project: { _id: 0, addedAt: 1, userId: 1, login: '$userLogin' },
            },
          ],
          as: 'newestLikes',
        },
      },
      {
        $project: {
          _id: 0,
          id: 1,
          title: 1,
          shortDescription: 1,
          content: 1,
          blogId: 1,
          blogName: 1,
          createdAt: 1,
          'extendedLikesInfo.likesCount': {
            $cond: {
              if: { $eq: [{ $size: '$likesCount' }, 0] },
              then: 0,
              else: '$likesCount.count',
            },
          },
          'extendedLikesInfo.dislikesCount': {
            $cond: {
              if: { $eq: [{ $size: '$dislikesCount' }, 0] },
              then: 0,
              else: '$dislikesCount.count',
            },
          },
          'extendedLikesInfo.myStatus': {
            $cond: {
              if: { $eq: [{ $size: '$myStatus' }, 0] },
              then: 'None',
              else: '$myStatus.reactionStatus',
            },
          },
          'extendedLikesInfo.newestLikes': '$newestLikes',
        },
      },
      { $unwind: '$extendedLikesInfo.likesCount' },
      { $unwind: '$extendedLikesInfo.dislikesCount' },
      { $unwind: '$extendedLikesInfo.myStatus' },
    ]);
    return result[0];
  }

  async getAllPostsByBlogId(
    blogId: string,
    postPaginationQueryDto: PostPaginationQueryDto,
    userId: string | null,
  ): Promise<PaginationViewModel<PostViewModel[]>> {
    const posts = await this.postModel.aggregate([
      { $match: { blogId } },
      {
        $sort: {
          [postPaginationQueryDto.sortBy]:
            postPaginationQueryDto.sortDirection === 'asc' ? 1 : -1,
        },
      },
      {
        $skip:
          (postPaginationQueryDto.pageNumber - 1) *
          postPaginationQueryDto.pageSize,
      },
      { $limit: postPaginationQueryDto.pageSize },
      {
        $lookup: {
          from: 'reactions',
          localField: 'id',
          foreignField: 'parentId',
          pipeline: [
            {
              $match: {
                reactionStatus: 'Like',
                isUserBanned: false,
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
                reactionStatus: 'Dislike',
                isUserBanned: false,
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
        $lookup: {
          from: 'reactions',
          localField: 'id',
          foreignField: 'parentId',
          pipeline: [
            {
              $match: {
                reactionStatus: 'Like',
                isUserBanned: false,
              },
            },
            { $sort: { addedAt: -1 } },
            { $limit: 3 },
            {
              $project: { _id: 0, addedAt: 1, userId: 1, login: '$userLogin' },
            },
          ],
          as: 'newestLikes',
        },
      },
      {
        $project: {
          _id: 0,
          id: 1,
          title: 1,
          shortDescription: 1,
          content: 1,
          blogId: 1,
          blogName: 1,
          createdAt: 1,
          'extendedLikesInfo.likesCount': {
            $cond: {
              if: { $eq: [{ $size: '$likesCount' }, 0] },
              then: 0,
              else: '$likesCount.count',
            },
          },
          'extendedLikesInfo.dislikesCount': {
            $cond: {
              if: { $eq: [{ $size: '$dislikesCount' }, 0] },
              then: 0,
              else: '$dislikesCount.count',
            },
          },
          'extendedLikesInfo.myStatus': {
            $cond: {
              if: { $eq: [{ $size: '$myStatus' }, 0] },
              then: 'None',
              else: '$myStatus.reactionStatus',
            },
          },
          'extendedLikesInfo.newestLikes': '$newestLikes',
        },
      },
      { $unwind: '$extendedLikesInfo.likesCount' },
      { $unwind: '$extendedLikesInfo.dislikesCount' },
      { $unwind: '$extendedLikesInfo.myStatus' },
    ]);
    const totalCount = await this.postModel.countDocuments({ blogId });
    return new PaginationViewModel(
      totalCount,
      postPaginationQueryDto.pageNumber,
      postPaginationQueryDto.pageSize,
      posts,
    );
  }
}
