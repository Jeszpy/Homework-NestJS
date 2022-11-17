import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { CreatePostDto } from '../dto/create-post.dto';
import { UpdatePostDto } from '../dto/update-post.dto';
import { PostRepositoryMongodb } from '../infrastructure/post.repository.mongodb';
import { Post } from '../models/post.schema';
import { randomUUID } from 'crypto';
import { PostViewModel } from '../models/post-view-model';
import { IBlogQueryRepository } from '../../blog/interfaces/IBlogQueryRepository';

@Injectable()
export class PostService {
  constructor(
    private postRepository: PostRepositoryMongodb,
    @Inject(IBlogQueryRepository)
    protected blogQueryRepository: IBlogQueryRepository,
  ) {}
  async createNewPost(createPostDto: CreatePostDto): Promise<PostViewModel> {
    const blog = await this.blogQueryRepository.getOneBlogById(
      createPostDto.blogId,
    );
    const newPost: Post = {
      id: randomUUID(),
      title: createPostDto.title,
      shortDescription: createPostDto.shortDescription,
      content: createPostDto.content,
      blogId: blog.id,
      blogName: blog.name,
    };
    const result = await this.postRepository.createNewPost({ ...newPost });
    if (!result) throw new BadRequestException();
    return newPost;
  }

  async updateOnePostById(id: string, updatePostDto: UpdatePostDto) {
    const blog = await this.blogQueryRepository.getOneBlogById(
      updatePostDto.blogId,
    );
    if (!blog) return null;
    const postForUpdate: Post = {
      id,
      title: updatePostDto.title,
      shortDescription: updatePostDto.shortDescription,
      content: updatePostDto.content,
      blogId: blog.id,
      blogName: blog.name,
    };
    return this.postRepository.updateOnePostById(id, postForUpdate);
  }

  async deleteOnePostById(id: string) {
    return this.postRepository.deleteOnePostById(id);
  }
}
