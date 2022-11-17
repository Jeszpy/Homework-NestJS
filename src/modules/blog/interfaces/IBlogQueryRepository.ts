import { BlogViewModel } from '../models/blog-view-model';

export interface IBlogQueryRepository {
  getAllBlogs(): Promise<BlogViewModel[]>;
  getOneBlogById(id: string): Promise<BlogViewModel | null>;
}

export const IBlogQueryRepository = 'IBlogQueryRepository';
