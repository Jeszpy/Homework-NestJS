import { BlogViewModel } from '../models/blog-view-model';
import { InjectModel } from '@nestjs/mongoose';
import { Blog, BlogDocument } from '../models/blog.schema';
import { FilterQuery, Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { IBlogQueryRepository } from '../interfaces/IBlogQueryRepository';
import { BlogPaginationQueryDto } from '../../../helpers/pagination/dto/blog-pagination-query.dto';
import { PaginationViewModel } from '../../../helpers/pagination/pagination-view-model.mapper';
import { BlogBySaViewModel } from '../models/blog-by-sa-view-model';

@Injectable()
export class BlogQueryRepositoryMongodb implements IBlogQueryRepository {
  constructor(@InjectModel(Blog.name) private blogModel: Model<BlogDocument>) {}

  async getAllBlogs(blogPaginationQueryDto: BlogPaginationQueryDto): Promise<PaginationViewModel<BlogViewModel[]>> {
    const filter = {
      name: {
        $regex: blogPaginationQueryDto.searchNameTerm ?? '',
        $options: 'i',
      },
    };
    return this.findBlogsByFilterAndPagination(filter, blogPaginationQueryDto);
  }

  async getBlogViewModelById(blogId: string): Promise<BlogViewModel | null> {
    return this.blogModel.findOne({ id: blogId }, { _id: false, ownerId: false, isBanned: false });
  }

  async getBlogById(blogId: string): Promise<Blog | null> {
    return this.blogModel.findOne({ id: blogId });
  }

  async getAllBlogsByOwnerId(
    blogPaginationQueryDto: BlogPaginationQueryDto,
    userId: string,
  ): Promise<PaginationViewModel<BlogViewModel[]>> {
    const filter = {
      ownerId: userId,
      name: {
        $regex: blogPaginationQueryDto.searchNameTerm ?? '',
        $options: 'i',
      },
    };
    return this.findBlogsByFilterAndPagination(filter, blogPaginationQueryDto);
  }

  async getAllBlogsBySA(blogPaginationQueryDto: BlogPaginationQueryDto): Promise<PaginationViewModel<BlogBySaViewModel[]>> {
    const filter: FilterQuery<Blog> = { name: { $regex: blogPaginationQueryDto.searchNameTerm ?? '', $options: 'i' } };
    const blogs = await this.blogModel.aggregate([
      { $match: filter },
      {
        $sort: {
          [blogPaginationQueryDto.sortBy]: blogPaginationQueryDto.sortDirection === 'asc' ? 1 : -1,
        },
      },
      {
        $skip: (blogPaginationQueryDto.pageNumber - 1) * blogPaginationQueryDto.pageSize,
      },
      { $limit: blogPaginationQueryDto.pageSize },
      {
        $lookup: {
          from: 'userentities',
          localField: 'ownerId',
          foreignField: 'id',
          pipeline: [
            {
              $project: {
                _id: 0,
                userLogin: '$accountData.login',
              },
            },
          ],
          as: 'user',
        },
      },
      { $unwind: '$user' },
      {
        $project: {
          _id: 0,
          id: 1,
          name: 1,
          description: 1,
          websiteUrl: 1,
          createdAt: 1,
          'blogOwnerInfo.userId': '$ownerId',
          'blogOwnerInfo.userLogin': '$user.userLogin',
        },
      },
    ]);
    const totalCount = await this.blogModel.countDocuments(filter);
    return new PaginationViewModel<BlogBySaViewModel[]>(
      totalCount,
      blogPaginationQueryDto.pageNumber,
      blogPaginationQueryDto.pageSize,
      blogs,
    );
  }

  private async findBlogsByFilterAndPagination(
    filter: FilterQuery<Blog>,
    blogPaginationQueryDto: BlogPaginationQueryDto,
  ): Promise<PaginationViewModel<BlogViewModel[]>> {
    const blogs = await this.blogModel
      .find(filter, { _id: false, ownerId: false, isBanned: false })
      .skip((blogPaginationQueryDto.pageNumber - 1) * blogPaginationQueryDto.pageSize)
      .limit(blogPaginationQueryDto.pageSize)
      .sort({
        [blogPaginationQueryDto.sortBy]: blogPaginationQueryDto.sortDirection === 'asc' ? 1 : -1,
      })
      .lean();
    const totalCount = await this.blogModel.countDocuments(filter);
    return new PaginationViewModel<BlogViewModel[]>(totalCount, blogPaginationQueryDto.pageNumber, blogPaginationQueryDto.pageSize, blogs);
  }
}
