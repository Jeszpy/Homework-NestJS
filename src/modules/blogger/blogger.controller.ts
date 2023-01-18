import { Body, Controller, Delete, Get, HttpCode, Inject, NotFoundException, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { BearerAuthGuard } from '../../guards/bearer-auth.guard';
import { BlogService } from '../blog/application/blog.service';
import { UpdateBlogDto } from '../blog/dto/update-blog.dto';
import { CreatePostDto } from '../post/dto/create-post.dto';
import { PostViewModel } from '../post/models/post-view-model';
import { PostService } from '../post/application/post.service';
import { CreateBlogDto } from '../blog/dto/create-blog.dto';
import { BlogViewModel } from '../blog/models/blog-view-model';
import { BlogPaginationQueryDto } from '../../helpers/pagination/dto/blog-pagination-query.dto';
import { PaginationViewModel } from '../../helpers/pagination/pagination-view-model.mapper';
import { IBlogQueryRepository, IBlogQueryRepositoryKey } from '../blog/interfaces/IBlogQueryRepository';
import { User } from '../../decorators/param/user.decorator';
import { UserEntity } from '../user/models/user.schema';

@UseGuards(BearerAuthGuard)
@Controller('blogger/blogs')
export class BloggerController {
  constructor(
    private readonly blogsService: BlogService,
    private readonly postsService: PostService,
    @Inject(IBlogQueryRepositoryKey)
    private readonly blogQueryRepository: IBlogQueryRepository,
  ) {}

  @Delete(':blogId')
  @HttpCode(204)
  async deleteOneBlogById(@Param('blogId') blogId: string, @User() user: UserEntity) {
    return this.blogsService.deleteOneBlogById(blogId, user.id);
  }

  @Put(':blogId')
  @HttpCode(204)
  async updateOneBlogById(@Param('blogId') blogId: string, @User() user: UserEntity, @Body() updateBlogDto: UpdateBlogDto) {
    return this.blogsService.updateOneBlogById(blogId, updateBlogDto, user.id);
  }

  @Post(':blogId/posts')
  @HttpCode(201)
  async createPostByBlogId(
    @Param('blogId') blogId: string,
    @User() user: UserEntity,
    @Body() createPostDto: CreatePostDto,
  ): Promise<PostViewModel> {
    return this.postsService.createNewPost(blogId, user.id, createPostDto);
  }

  @Post()
  @HttpCode(201)
  async createNewBlog(@User() user: UserEntity, @Body() createBlogDto: CreateBlogDto): Promise<BlogViewModel> {
    return this.blogsService.createNewBlog(createBlogDto, user.id);
  }

  @Get()
  async getAllBlogsByOwner(
    @Query() blogPaginationQueryDto: BlogPaginationQueryDto,
    @User() user: UserEntity,
  ): Promise<PaginationViewModel<BlogViewModel[]>> {
    return this.blogQueryRepository.getAllBlogsByOwnerId(blogPaginationQueryDto, user.id);
  }
}
