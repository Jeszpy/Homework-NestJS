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
} from '@nestjs/common';
import { BlogService } from '../application/blog.service';
import { CreateBlogDto } from '../dto/create-blog.dto';
import { UpdateBlogDto } from '../dto/update-blog.dto';
import { BlogViewModel } from '../models/blog-view-model';
import { BasicAuthGuard } from '../../../guards/basic-auth.guard';
import { IBlogQueryRepository } from '../interfaces/IBlogQueryRepository';
import { CreatePostDto } from '../../post/dto/create-post.dto';
import { PostService } from '../../post/application/post.service';

@Controller('blogs')
export class BlogController {
  constructor(
    private readonly blogsService: BlogService,
    private readonly postsService: PostService,
    @Inject(IBlogQueryRepository)
    protected blogQueryRepository: IBlogQueryRepository,
  ) {}

  @Post()
  @UseGuards(BasicAuthGuard)
  @HttpCode(201)
  async createNewBlog(@Body() createBlogDto: CreateBlogDto) {
    return this.blogsService.createNewBlog(createBlogDto);
  }

  @Get()
  async getAllBlogs(): Promise<BlogViewModel[]> {
    return this.blogQueryRepository.getAllBlogs();
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

  @Post(':blogId')
  @UseGuards(BasicAuthGuard)
  @HttpCode(201)
  async createPostByBlogId(
    @Param('blogId') blogId: string,
    @Body() createPostDto: CreatePostDto,
  ) {
    return this.postsService.createNewPost(blogId, createPostDto);
  }
}
