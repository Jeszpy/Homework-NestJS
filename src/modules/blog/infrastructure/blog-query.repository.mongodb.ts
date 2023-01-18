import { BlogViewModel } from '../models/blog-view-model';
import { InjectModel } from '@nestjs/mongoose';
import { Blog, BlogDocument } from '../models/blog.schema';
import { FilterQuery, Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { IBlogQueryRepository } from '../interfaces/IBlogQueryRepository';
import { BlogPaginationQueryDto } from '../../../helpers/pagination/dto/blog-pagination-query.dto';
import { PaginationViewModel } from '../../../helpers/pagination/pagination-view-model.mapper';

@Injectable()
export class BlogQueryRepositoryMongodb implements IBlogQueryRepository {
  constructor(@InjectModel(Blog.name) private blogModel: Model<BlogDocument>) {}

  async getAllBlogs(
    blogPaginationQueryDto: BlogPaginationQueryDto,
  ): Promise<PaginationViewModel<BlogViewModel[]>> {
    const filter = {
      name: {
        $regex: blogPaginationQueryDto.searchNameTerm ?? '',
        $options: 'i',
      },
    };
    return this.findBlogsByFilterAndPagination(filter, blogPaginationQueryDto);
  }

  async getBlogViewModelById(blogId: string): Promise<BlogViewModel | null> {
    return this.blogModel.findOne(
      { id: blogId },
      { _id: false, ownerId: false, isBanned: false },
    );
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

  private async findBlogsByFilterAndPagination(
    filter: FilterQuery<Blog>,
    blogPaginationQueryDto: BlogPaginationQueryDto,
  ): Promise<PaginationViewModel<BlogViewModel[]>> {
    const blogs = await this.blogModel
      .find(filter, { _id: false, ownerId: false, isBanned: false })
      .skip(
        (blogPaginationQueryDto.pageNumber - 1) *
          blogPaginationQueryDto.pageSize,
      )
      .limit(blogPaginationQueryDto.pageSize)
      .sort({
        [blogPaginationQueryDto.sortBy]:
          blogPaginationQueryDto.sortDirection === 'asc' ? 1 : -1,
      })
      .lean();
    const totalCount = await this.blogModel.countDocuments(filter);
    return new PaginationViewModel<BlogViewModel[]>(
      totalCount,
      blogPaginationQueryDto.pageNumber,
      blogPaginationQueryDto.pageSize,
      blogs,
    );
  }
}
