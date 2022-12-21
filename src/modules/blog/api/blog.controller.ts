import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  NotFoundException,
  HttpCode,
  UseGuards,
  Inject,
  Query,
} from '@nestjs/common';
import { BlogService } from '../application/blog.service';
import { CreateBlogDto } from '../dto/create-blog.dto';
import { UpdateBlogDto } from '../dto/update-blog.dto';
import { BlogViewModel } from '../models/blog-view-model';
import { BasicAuthGuard } from '../../../guards/basic-auth.guard';
import {
  IBlogQueryRepository,
  IBlogQueryRepositoryKey,
} from '../interfaces/IBlogQueryRepository';
import { CreatePostDto } from '../../post/dto/create-post.dto';
import { PostService } from '../../post/application/post.service';
import { PostViewModel } from '../../post/models/post-view-model';
import { PostQueryRepositoryMongodb } from '../../post/infrastructure/post-query.repository.mongodb';
import { BlogPaginationQueryDto } from '../../../helpers/pagination/dto/blog-pagination-query.dto';
import { PaginationViewModel } from '../../../helpers/pagination/pagination-view-model.mapper';
import { PostPaginationQueryDto } from '../../../helpers/pagination/dto/post-pagination-query.dto';
import { SkipThrottle } from '@nestjs/throttler';

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

  @Post()
  @UseGuards(BasicAuthGuard)
  @HttpCode(201)
  async createNewBlog(
    @Body() createBlogDto: CreateBlogDto,
  ): Promise<BlogViewModel> {
    return this.blogsService.createNewBlog(createBlogDto);
  }

  @Get()
  async getAllBlogs(
    @Query() blogPaginationQueryDto: BlogPaginationQueryDto,
  ): Promise<PaginationViewModel<BlogViewModel[]>> {
    return this.blogQueryRepository.getAllBlogs(blogPaginationQueryDto);
  }

  @Get(':blogId')
  async getOneBlogById(
    @Param('blogId') blogId: string,
  ): Promise<BlogViewModel> {
    const blog = await this.blogQueryRepository.getOneBlogById(blogId);
    if (!blog) throw new NotFoundException();
    return blog;
  }

  @Put(':blogId')
  @UseGuards(BasicAuthGuard)
  @HttpCode(204)
  async updateOneBlogById(
    @Param('blogId') blogId: string,
    @Body() updateBlogDto: UpdateBlogDto,
  ) {
    const blogUpdated = await this.blogsService.updateOneBlogById(
      blogId,
      updateBlogDto,
    );
    if (!blogUpdated) throw new NotFoundException();
    return;
  }

  @Delete(':blogId')
  @UseGuards(BasicAuthGuard)
  @HttpCode(204)
  async deleteOneBlogById(@Param('blogId') blogId: string) {
    const blogDeleted = await this.blogsService.deleteOneBlogById(blogId);
    if (!blogDeleted) throw new NotFoundException();
    return;
  }

  @Get(':blogId/posts')
  async getPostsByBlogId(
    @Param('blogId') blogId: string,
    @Query() postPaginationQueryDto: PostPaginationQueryDto,
  ): Promise<PaginationViewModel<PostViewModel[]>> {
    const blog = await this.blogQueryRepository.getOneBlogById(blogId);
    if (!blog) throw new NotFoundException();
    return this.postQueryRepository.getAllPostsByBlogId(
      blogId,
      postPaginationQueryDto,
    );
  }

  @Post(':blogId/posts')
  @UseGuards(BasicAuthGuard)
  @HttpCode(201)
  async createPostByBlogId(
    @Param('blogId') blogId: string,
    @Body() createPostDto: CreatePostDto,
  ): Promise<PostViewModel> {
    return this.postsService.createNewPost(blogId, createPostDto);
  }
}
