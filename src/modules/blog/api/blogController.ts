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

@Controller('blogs')
export class BlogController {
  constructor(
    private readonly blogsService: BlogService,
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
    // console.log('BlogController => getAllBlogs');
    return this.blogQueryRepository.getAllBlogs();
  }

  @Get(':id')
  async getOneBlogById(@Param('id') id: string): Promise<BlogViewModel> {
    const blog = await this.blogQueryRepository.getOneBlogById(id);
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

  @Delete(':id')
  @UseGuards(BasicAuthGuard)
  @HttpCode(204)
  async deleteOneBlogById(@Param('id') id: string) {
    return this.blogsService.deleteOneBlogById(id);
  }
}
