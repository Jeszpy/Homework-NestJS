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
    userId?: string,
  ): Promise<PaginationViewModel<PostViewModel[]>> {
    // const posts = await this.postModel
    //   .find({}, { _id: false })
    //   .skip(
    //     (postPaginationQueryDto.pageNumber - 1) *
    //       postPaginationQueryDto.pageSize,
    //   )
    //   .limit(postPaginationQueryDto.pageSize)
    //   .sort({
    //     [postPaginationQueryDto.sortBy]:
    //       postPaginationQueryDto.sortDirection === 'asc' ? 1 : -1,
    //   })
    //   .lean();
    const posts = await this.postModel.aggregate([
      {
        $lookup: {
          from: 'reactions',
          localField: 'id',
          foreignField: 'parentId',
          pipeline: [
            {
              $match: {
                reactionStatus: 'Like',
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
    userId?: string,
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
  ): Promise<PaginationViewModel<PostViewModel[]>> {
    const posts = await this.postModel
      .find({ blogId }, { _id: false })
      .skip(
        (postPaginationQueryDto.pageNumber - 1) *
          postPaginationQueryDto.pageSize,
      )
      .limit(postPaginationQueryDto.pageSize)
      .sort({
        [postPaginationQueryDto.sortBy]:
          postPaginationQueryDto.sortDirection === 'asc' ? 1 : -1,
      })
      .lean();
    const totalCount = await this.postModel.countDocuments({ blogId });
    return new PaginationViewModel(
      totalCount,
      postPaginationQueryDto.pageNumber,
      postPaginationQueryDto.pageSize,
      posts,
    );
  }
}
