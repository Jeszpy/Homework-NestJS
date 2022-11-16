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
  HttpException,
} from '@nestjs/common';
import { BlogService } from '../application/blog.service';
import { CreateBlogDto } from '../dto/create-blog.dto';
import { UpdateBlogDto } from '../dto/update-blog.dto';
import { BlogQueryRepositoryMongodb } from '../infrastructure/blog-query.repository.mongodb';
import { BlogViewModel } from '../models/blog-view-model';

@Controller('blogs')
export class BlogController {
  constructor(
    private readonly blogsService: BlogService,
    private readonly blogQueryRepository: BlogQueryRepositoryMongodb,
  ) {}

  @Post()
  @HttpCode(201)
  async createNewBlog(@Body() createBlogDto: CreateBlogDto) {
    return this.blogsService.createNewBlog(
      createBlogDto.name,
      createBlogDto.youtubeUrl,
    );
  }

  @Get()
  async getAllBlogs(): Promise<BlogViewModel[]> {
    return this.blogQueryRepository.getAllBlogs();
  }

  @Get(':id')
  async getOneBlogById(@Param('id') id: string): Promise<BlogViewModel> {
    const blog = await this.blogQueryRepository.getOneBlogById(id);
    if (!blog) throw new NotFoundException();
    return blog;
  }

  @Put(':id')
  @HttpCode(204)
  async updateOneBlogById(
    @Param('id') id: string,
    @Body() updateBlogDto: UpdateBlogDto,
  ) {
    return this.blogsService.updateOneBlogById(
      id,
      updateBlogDto.name,
      updateBlogDto.youtubeUrl,
    );
  }

  @Delete(':id')
  @HttpCode(204)
  async deleteOneBlogById(@Param('id') id: string) {
    return this.blogsService.deleteOneBlogById(id);
  }
}
