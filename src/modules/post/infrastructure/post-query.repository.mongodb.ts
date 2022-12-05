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
  ): Promise<PaginationViewModel<PostViewModel[]>> {
    const posts = await this.postModel
      .find({}, { _id: false })
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
    const totalCount = await this.postModel.countDocuments({});
    return new PaginationViewModel(
      totalCount,
      postPaginationQueryDto.pageNumber,
      postPaginationQueryDto.pageSize,
      posts,
    );
  }

  async getOnePostById(postId: string): Promise<PostViewModel | null> {
    return this.postModel.findOne({ id: postId }, { _id: false });
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
