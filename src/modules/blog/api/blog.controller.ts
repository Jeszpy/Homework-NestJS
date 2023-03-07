import { Controller, Get, Inject, NotFoundException, Param, Query, UseGuards } from '@nestjs/common';
import { BlogService } from '../application/blog.service';
import { BlogViewModel } from '../models/blog-view-model';
import { IBlogQueryRepository, IBlogQueryRepositoryKey } from '../interfaces/IBlogQueryRepository';
import { PostService } from '../../post/application/post.service';
import { PostViewModel } from '../../post/models/post-view-model';
import { PostQueryRepositoryMongodb } from '../../post/infrastructure/post-query.repository.mongodb';
import { BlogPaginationQueryDto } from '../../../helpers/pagination/dto/blog-pagination-query.dto';
import { PaginationViewModel } from '../../../helpers/pagination/pagination-view-model.mapper';
import { PostPaginationQueryDto } from '../../../helpers/pagination/dto/post-pagination-query.dto';
import { SkipThrottle } from '@nestjs/throttler';
import { GetUserIdFromBearerToken } from '../../../guards/get-userId-from-bearer-token';
import { UserId } from '../../../decorators/param/userId.decorator';

@SkipThrottle()
@Controller('blogs')
export class BlogController {
  constructor(
    private readonly blogsService: BlogService,
    private readonly postsService: PostService,
    @Inject(IBlogQueryRepositoryKey)
    private readonly blogQueryRepository: IBlogQueryRepository,
    private readonly postQueryRepository: PostQueryRepositoryMongodb,
  ) {}

  @Get()
  async getAllBlogs(@Query() blogPaginationQueryDto: BlogPaginationQueryDto): Promise<PaginationViewModel<BlogViewModel[]>> {
    return this.blogQueryRepository.getAllBlogs(blogPaginationQueryDto);
  }

  @Get(':blogId')
  async getOneBlogById(@Param('blogId') blogId: string): Promise<BlogViewModel> {
    const blog = await this.blogQueryRepository.getBlogViewModelById(blogId);
    if (!blog) throw new NotFoundException();
    return blog;
  }

  @UseGuards(GetUserIdFromBearerToken)
  @Get(':blogId/posts')
  async getPostsByBlogId(
    @Param('blogId') blogId: string,
    @Query() postPaginationQueryDto: PostPaginationQueryDto,
    @UserId() userId: string | null,
  ): Promise<PaginationViewModel<PostViewModel[]>> {
    const blog = await this.blogQueryRepository.getBlogViewModelById(blogId);
    if (!blog) throw new NotFoundException();
    return this.postQueryRepository.getAllPostsByBlogId(blogId, postPaginationQueryDto, userId);
  }
}
