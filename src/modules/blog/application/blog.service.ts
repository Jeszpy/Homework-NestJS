import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { BlogRepositoryMongodb } from '../infrastructure/blog.repository.mongodb';
import { Blog } from '../models/blogs.schema';
import { randomUUID } from 'crypto';
import { BlogViewModel } from '../models/blog-view-model';
import { PostRepositoryMongodb } from '../../post/infrastructure/post.repository.mongodb';
import { UpdateBlogDto } from '../dto/update-blog.dto';
import { CreateBlogDto } from '../dto/create-blog.dto';

@Injectable()
export class BlogService {
  constructor(
    private readonly blogRepository: BlogRepositoryMongodb,
    private readonly postRepository: PostRepositoryMongodb,
  ) {}

  async createNewBlog(createBlogDto: CreateBlogDto): Promise<BlogViewModel> {
    const newBlog: Blog = {
      id: randomUUID(),
      name: createBlogDto.name,
      description: createBlogDto.description,
      websiteUrl: createBlogDto.websiteUrl,
    };
    const result = await this.blogRepository.createNewBlog({ ...newBlog });
    if (!result) throw new BadRequestException();
    return newBlog;
  }

  async updateOneBlogById(
    blogId: string,
    updateBlogDto: UpdateBlogDto,
  ): Promise<boolean> {
    const blogUpdateData: Blog = {
      id: blogId,
      name: updateBlogDto.name,
      description: updateBlogDto.description,
      websiteUrl: updateBlogDto.websiteUrl,
    };
    return this.blogRepository.updateOneBlogById(blogUpdateData);
    // if (!isUpdated) throw new NotFoundException();
    // TODO: cascade update
    //  await this.postRepository.updateBlogNameForPosts(
    //  blogId,
    //  blogUpdateData.name,
    //  );
    // return true;
  }

  async deleteOneBlogById(id: string): Promise<boolean> {
    const isDeleted = await this.blogRepository.deleteOneBlogById(id);
    if (!isDeleted) throw new NotFoundException();
    // TODO: cascade delete
    //  await this.postRepository.deletePostsByBlogId(id);
    return true;
  }
}
