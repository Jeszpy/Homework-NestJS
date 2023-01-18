import { BlogViewModel } from '../models/blog-view-model';
import { BlogQueryRepositoryMongodb } from '../infrastructure/blog-query.repository.mongodb';
import { BlogPaginationQueryDto } from '../../../helpers/pagination/dto/blog-pagination-query.dto';
import { PaginationViewModel } from '../../../helpers/pagination/pagination-view-model.mapper';
import { BlogQueryRepositoryRawSql } from '../infrastructure/blog-query.repository.raw-sql';
import { ConfigService } from '@nestjs/config';
import { Blog } from '../models/blog.schema';
import { BlogBySaViewModel } from '../models/blog-by-sa-view-model';

export interface IBlogQueryRepository {
  getAllBlogs(blogPaginationQueryDto: BlogPaginationQueryDto): Promise<PaginationViewModel<BlogViewModel[]>>;

  getBlogViewModelById(blogId: string): Promise<BlogViewModel | null>;

  getBlogById(blogId: string): Promise<Blog | null>;

  getAllBlogsByOwnerId(blogPaginationQueryDto: BlogPaginationQueryDto, userId: string): Promise<PaginationViewModel<BlogViewModel[]>>;

  getAllBlogsBySA(blogPaginationQueryDto: BlogPaginationQueryDto): Promise<PaginationViewModel<BlogBySaViewModel[]>>;
}

export const IBlogQueryRepositoryKey = Symbol('IBlogQueryRepository');

export const BlogQueryRepository = () => {
  const configService = new ConfigService();
  const dbType = configService.get('DB_TYPE');
  switch (dbType) {
    case 'MongoDB':
      return {
        provide: IBlogQueryRepositoryKey,
        useClass: BlogQueryRepositoryMongodb,
      };
    case 'RawSql':
      return {
        provide: IBlogQueryRepositoryKey,
        useClass: BlogQueryRepositoryRawSql,
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

// export class BlogQueryRepository {
//   constructor(private readonly configService: ConfigService) {}
//   private dbType = this.configService.get('DB_TYPE');
//
//   inject() {
//     // switch (this.dbType) {
//     switch (process.env.DB_TYPE) {
//       case 'MongoDB':
//         return {
//           provide: IBlogQueryRepositoryKey,
//           useClass: BlogQueryRepositoryMongodb,
//         };
//       case 'RawSql':
//         return {
//           provide: IBlogQueryRepositoryKey,
//           useClass: BlogQueryRepositoryMongodb,
//         };
//       case 'PostgresSql':
//         return {
//           provide: IBlogQueryRepositoryKey,
//           useClass: BlogQueryRepositoryMongodb,
//         };
//       default:
//         return {
//           provide: IBlogQueryRepositoryKey,
//           useClass: BlogQueryRepositoryMongodb,
//         };
//     }
//   }
// }
//
// const forExp = new BlogQueryRepository(new ConfigService());
//
// module.exports = forExp.inject();
//
// export interface ISendNotify {
//   sendNotifyToUser(userId: string): Promise<boolean>;
// }
//
// class emailSender implements ISendNotify {
//   async sendNotifyToUser(userId: string) {
//     return true;
//   }
// }
// class tgSender implements ISendNotify {
//   async sendNotifyToUser(userId: string) {
//     return true;
//   }
// }
// class smsSender implements ISendNotify {
//   async sendNotifyToUser(userId: string) {
//     return true;
//   }
// }
