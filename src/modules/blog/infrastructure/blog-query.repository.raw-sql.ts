import { IBlogQueryRepository } from '../interfaces/IBlogQueryRepository';
import { BlogPaginationQueryDto } from '../../../helpers/pagination/dto/blog-pagination-query.dto';
import { PaginationViewModel } from '../../../helpers/pagination/pagination-view-model.mapper';
import { BlogViewModel } from '../models/blog-view-model';
import { Blog } from '../models/blog.schema';

export class BlogQueryRepositoryRawSql implements IBlogQueryRepository {
  constructor() {
    console.log('BlogQueryRepositoryRawSql class');
  }

  async getAllBlogs(
    blogPaginationQueryDto: BlogPaginationQueryDto,
  ): Promise<PaginationViewModel<BlogViewModel[]>> {
    return {
      pagesCount: 0,
      page: 0,
      pageSize: 0,
      totalCount: 0,
      items: [
        {
          id: 'string',
          name: 'string',
          description: 'string',
          websiteUrl: 'string',
          createdAt: '2023-01-04T12:23:15.896Z',
        },
      ],
    };
  }

  async getBlogById(blogId: string): Promise<Blog | null> {
    return {
      id: 'string',
      ownerId: 'string',
      name: 'string',
      description: 'string',
      websiteUrl: 'string',
      createdAt: '2023-01-04T12:23:15.896Z',
      isBanned: false,
    };
  }

  async getBlogViewModelById(blogId: string): Promise<BlogViewModel | null> {
    return {
      id: 'string',
      name: 'string',
      description: 'string',
      websiteUrl: 'string',
      createdAt: '2023-01-04T12:23:15.896Z',
    };
  }

  async getAllBlogsByOwnerId(
    blogPaginationQueryDto: BlogPaginationQueryDto,
    userId: string,
  ): Promise<PaginationViewModel<BlogViewModel[]>> {
    return {
      pagesCount: 0,
      page: 0,
      pageSize: 0,
      totalCount: 0,
      items: [
        {
          id: 'string',
          name: 'string',
          description: 'string',
          websiteUrl: 'string',
          createdAt: '2023-01-04T12:23:15.896Z',
        },
      ],
    };
  }
}
