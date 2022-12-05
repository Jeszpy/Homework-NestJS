import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreatePostDto } from '../dto/create-post.dto';
import { UpdatePostDto } from '../dto/update-post.dto';
import { PostRepositoryMongodb } from '../infrastructure/post.repository.mongodb';
import { Post } from '../models/post.schema';
import { randomUUID } from 'crypto';
import { PostViewModel } from '../models/post-view-model';
import {
  IBlogQueryRepository,
  IBlogQueryRepositoryKey,
} from '../../blog/interfaces/IBlogQueryRepository';
import { PostUpdateModel } from '../models/post-update-model';

@Injectable()
export class PostService {
  constructor(
    private postRepository: PostRepositoryMongodb,
    @Inject(IBlogQueryRepositoryKey)
    protected blogQueryRepository: IBlogQueryRepository,
  ) {}
  async createNewPost(
    blogId: string,
    createPostDto: CreatePostDto,
  ): Promise<PostViewModel> {
    const blog = await this.blogQueryRepository.getOneBlogById(blogId);
    if (!blog) throw new NotFoundException();
    const newPost: Post = {
      id: randomUUID(),
      title: createPostDto.title,
      shortDescription: createPostDto.shortDescription,
      content: createPostDto.content,
      blogId: blog.id,
      blogName: blog.name,
      createdAt: new Date().toISOString(),
    };
    const result = await this.postRepository.createNewPost({ ...newPost });
    if (!result) throw new BadRequestException();
    return newPost;
  }

  async updateOnePostById(postId: string, updatePostDto: UpdatePostDto) {
    const blog = await this.blogQueryRepository.getOneBlogById(
      updatePostDto.blogId,
    );
    if (!blog) return null;
    const postForUpdate: PostUpdateModel = {
      title: updatePostDto.title,
      shortDescription: updatePostDto.shortDescription,
      content: updatePostDto.content,
      blogId: blog.id,
      blogName: blog.name,
    };
    return this.postRepository.updateOnePostById(postId, postForUpdate);
  }

  async deleteOnePostById(postId: string) {
    return this.postRepository.deleteOnePostById(postId);
  }
}
