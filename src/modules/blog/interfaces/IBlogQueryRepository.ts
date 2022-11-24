import { BlogViewModel } from '../models/blog-view-model';
import { BlogQueryRepositoryMongodb } from '../infrastructure/blog-query.repository.mongodb';

export interface IBlogQueryRepository {
  getAllBlogs(): Promise<BlogViewModel[]>;
  getOneBlogById(id: string): Promise<BlogViewModel | null>;
}

export const IBlogQueryRepository = 'IBlogQueryRepository';

export const BlogQueryRepository = () => {
  const dbType = process.env.DB_TYPE;
  switch (dbType) {
    case 'MongoDB':
      return {
        provide: IBlogQueryRepository,
        useClass: BlogQueryRepositoryMongodb,
      };
    case 'RawSql':
      return {
        provide: IBlogQueryRepository,
        useClass: BlogQueryRepositoryMongodb,
      };
    case 'PostgresSql':
      return {
        provide: IBlogQueryRepository,
        useClass: BlogQueryRepositoryMongodb,
      };
    default:
      return {
        provide: IBlogQueryRepository,
        useClass: BlogQueryRepositoryMongodb,
      };
  }
};
