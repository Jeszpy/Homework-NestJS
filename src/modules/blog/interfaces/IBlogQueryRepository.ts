import { BlogViewModel } from '../models/blog-view-model';
import { BlogQueryRepositoryMongodb } from '../infrastructure/blog-query.repository.mongodb';
import { BlogPaginationQueryDto } from '../../../helpers/pagination/dto/blog-pagination-query.dto';
import { PaginationViewModel } from '../../../helpers/pagination/pagination-view-model.mapper';

export interface IBlogQueryRepository {
  getAllBlogs(
    blogPaginationQueryDto: BlogPaginationQueryDto,
  ): Promise<PaginationViewModel<BlogViewModel[]>>;
  getOneBlogById(id: string): Promise<BlogViewModel | null>;
}

export const IBlogQueryRepositoryKey = 'IBlogQueryRepository';

export const BlogQueryRepository = () => {
  const dbType = process.env.DB_TYPE;
  switch (dbType) {
    case 'MongoDB':
      return {
        provide: IBlogQueryRepositoryKey,
        useClass: BlogQueryRepositoryMongodb,
      };
    case 'RawSql':
      return {
        provide: IBlogQueryRepositoryKey,
        useClass: BlogQueryRepositoryMongodb,
      };
    case 'PostgresSql':
      return {
        provide: IBlogQueryRepositoryKey,
        useClass: BlogQueryRepositoryMongodb,
      };
    default:
      return {
        provide: IBlogQueryRepositoryKey,
        useClass: BlogQueryRepositoryMongodb,
      };
  }
};
