import { BlogViewModel } from '../models/blog-view-model';
import { InjectModel } from '@nestjs/mongoose';
import { Blog, BlogDocument } from '../models/blog.schema';
import { Model } from 'mongoose';
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
    const blogs = await this.blogModel
      .find(filter, { _id: false })
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

  async getOneBlogById(blogId: string): Promise<BlogViewModel | null> {
    return this.blogModel.findOne({ id: blogId }, { _id: false });
  }
}
