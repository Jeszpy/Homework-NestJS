import { BadRequestException, ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { BlogRepositoryMongodb } from '../infrastructure/blog.repository.mongodb';
import { Blog } from '../models/blog.schema';
import { randomUUID } from 'crypto';
import { BlogViewModel } from '../models/blog-view-model';
import { PostRepositoryMongodb } from '../../post/infrastructure/post.repository.mongodb';
import { UpdateBlogDto } from '../dto/update-blog.dto';
import { CreateBlogDto } from '../dto/create-blog.dto';
import { BlogUpdateModel } from '../models/blog-update-model';
import { IBlogQueryRepository, IBlogQueryRepositoryKey } from '../interfaces/IBlogQueryRepository';

@Injectable()
export class BlogService {
  constructor(
    private readonly blogRepository: BlogRepositoryMongodb,
    @Inject(IBlogQueryRepositoryKey)
    private readonly blogQueryRepository: IBlogQueryRepository,
  ) {}

  async createNewBlog(createBlogDto: CreateBlogDto, userId: string): Promise<BlogViewModel> {
    const newBlog: Blog = {
      id: randomUUID(),
      ownerId: userId,
      name: createBlogDto.name,
      description: createBlogDto.description,
      websiteUrl: createBlogDto.websiteUrl,
      createdAt: new Date().toISOString(),
      isBanned: false,
    };
    const result = await this.blogRepository.createNewBlog({ ...newBlog });
    if (!result) throw new BadRequestException();
    return new BlogViewModel(newBlog);
  }

  async updateOneBlogById(blogId: string, updateBlogDto: UpdateBlogDto, userId: string): Promise<boolean> {
    const blog = await this.blogQueryRepository.getBlogById(blogId);
    if (!blog) throw new NotFoundException();
    if (blog.ownerId !== userId) throw new ForbiddenException();
    const blogUpdateData: BlogUpdateModel = {
      name: updateBlogDto.name,
      description: updateBlogDto.description,
      websiteUrl: updateBlogDto.websiteUrl,
    };
    return this.blogRepository.updateOneBlogById(blogId, blogUpdateData);
    // if (!isUpdated) throw new NotFoundException();
    // TODO: cascade update
    //  await this.postRepository.updateBlogNameForPosts(
    //  blogId,
    //  blogUpdateData.name,
    //  );
    // return true;
  }

  async deleteOneBlogById(blogId: string, userId: string): Promise<boolean> {
    const blog = await this.blogQueryRepository.getBlogById(blogId);
    if (!blog) throw new NotFoundException();
    if (blog.ownerId !== userId) throw new ForbiddenException();
    // TODO: cascade delete
    //  await this.postRepository.deletePostsByBlogId(id);
    return this.blogRepository.deleteOneBlogById(blogId);
  }
}
