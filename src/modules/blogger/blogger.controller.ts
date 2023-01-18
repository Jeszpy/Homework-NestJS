import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpCode,
  Inject,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
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
import { UpdatePostDto } from '../post/dto/update-post.dto';

@UseGuards(BearerAuthGuard)
@Controller('blogger/blogs')
export class BloggerController {
  constructor(
    private readonly blogService: BlogService,
    private readonly postService: PostService,
    @Inject(IBlogQueryRepositoryKey)
    private readonly blogQueryRepository: IBlogQueryRepository,
  ) {}

  @Delete(':blogId')
  @HttpCode(204)
  async deleteOneBlogById(@Param('blogId') blogId: string, @User() user: UserEntity) {
    return this.blogService.deleteOneBlogById(blogId, user.id);
  }

  @Put(':blogId')
  @HttpCode(204)
  async updateOneBlogById(@Param('blogId') blogId: string, @User() user: UserEntity, @Body() updateBlogDto: UpdateBlogDto) {
    return this.blogService.updateOneBlogById(blogId, updateBlogDto, user.id);
  }

  @Post(':blogId/posts')
  @HttpCode(201)
  async createPostByBlogId(
    @Param('blogId') blogId: string,
    @User() user: UserEntity,
    @Body() createPostDto: CreatePostDto,
  ): Promise<PostViewModel> {
    const blog = await this.blogQueryRepository.getBlogById(blogId);
    if (!blog) throw new NotFoundException();
    if (blog.ownerId !== user.id) throw new ForbiddenException();
    return this.postService.createNewPost(blog.id, blog.name, user.id, createPostDto);
  }

  @Put(':blogId/posts/:postId')
  @HttpCode(204)
  async updatePostById(
    @Param('blogId') blogId: string,
    @Param('postId') postId: string,
    @User() user: UserEntity,
    @Body() updatePostDto: UpdatePostDto,
  ) {
    const blog = await this.blogQueryRepository.getBlogById(blogId);
    if (!blog) throw new NotFoundException();
    if (blog.ownerId !== user.id) throw new ForbiddenException();
    const isUpdated = await this.postService.updateOnePostById(blog.id, blog.name, postId, updatePostDto);
    if (!isUpdated) throw new NotFoundException();
    return;
  }

  @Delete(':blogId/posts/:postId')
  @HttpCode(204)
  async deletePostById(@Param('blogId') blogId: string, @Param('postId') postId: string, @User() user: UserEntity) {
    const blog = await this.blogQueryRepository.getBlogById(blogId);
    if (!blog) throw new NotFoundException();
    if (blog.ownerId !== user.id) throw new ForbiddenException();
    const isUpdated = await this.postService.deleteOnePostById(postId);
    if (!isUpdated) throw new NotFoundException();
    return;
  }

  @Post()
  @HttpCode(201)
  async createNewBlog(@User() user: UserEntity, @Body() createBlogDto: CreateBlogDto): Promise<BlogViewModel> {
    return this.blogService.createNewBlog(createBlogDto, user.id);
  }

  @Get()
  async getAllBlogsByOwner(
    @Query() blogPaginationQueryDto: BlogPaginationQueryDto,
    @User() user: UserEntity,
  ): Promise<PaginationViewModel<BlogViewModel[]>> {
    return this.blogQueryRepository.getAllBlogsByOwnerId(blogPaginationQueryDto, user.id);
  }
}
