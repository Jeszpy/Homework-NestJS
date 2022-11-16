import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
} from '@nestjs/common';
import { BlogService } from '../application/blog.service';
import { CreateBlogDto } from '../dto/create-blog.dto';
import { UpdateBlogDto } from '../dto/update-blog.dto';

@Controller('blogs')
export class BlogController {
  constructor(private readonly blogsService: BlogService) {}

  @Post()
  createNewBlog(@Body() createBlogDto: CreateBlogDto) {
    return this.blogsService.createNewBlog(createBlogDto);
  }

  @Get()
  getAllBlogs() {
    return this.blogsService.getAllBlogs();
  }

  @Get(':id')
  getOneBlogById(@Param('id') id: string) {
    return this.blogsService.getOneBlogById(id);
  }

  @Put(':id')
  updateOneBlogById(
    @Param('id') id: string,
    @Body() updateBlogDto: UpdateBlogDto,
  ) {
    return this.blogsService.updateOneBlogById(id, updateBlogDto);
  }

  @Delete(':id')
  deleteOneBlogById(@Param('id') id: string) {
    return this.blogsService.deleteOneBlogById(id);
  }
}
