import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreatePostDto } from '../dto/create-post.dto';
import { UpdatePostDto } from '../dto/update-post.dto';
import { PostRepositoryMongodb } from '../infrastructure/post.repository.mongodb';
import { Post } from '../models/post.schema';
import { randomUUID } from 'crypto';
import { PostViewModel } from '../models/post-view-model';
import { IBlogQueryRepository, IBlogQueryRepositoryKey } from '../../blog/interfaces/IBlogQueryRepository';
import { PostUpdateModel } from '../models/post-update-model';
import { ReactionStatusEnum } from '../../reaction/models/reaction.schema';

@Injectable()
export class PostService {
  constructor(
    private postRepository: PostRepositoryMongodb,
    @Inject(IBlogQueryRepositoryKey)
    protected blogQueryRepository: IBlogQueryRepository,
  ) {}
  async createNewPost(blogId: string, userId: string, createPostDto: CreatePostDto): Promise<PostViewModel> {
    const blog = await this.blogQueryRepository.getBlogById(blogId);
    if (!blog) throw new NotFoundException();
    const newPost: Post = {
      id: randomUUID(),
      title: createPostDto.title,
      shortDescription: createPostDto.shortDescription,
      content: createPostDto.content,
      blogId: blog.id,
      blogName: blog.name,
      createdAt: new Date().toISOString(),
      extendedLikesInfo: {
        likesCount: 0,
        dislikesCount: 0,
        myStatus: ReactionStatusEnum.None,
        newestLikes: [],
      },
    };
    const result = await this.postRepository.createNewPost({ ...newPost });
    if (!result) throw new BadRequestException();
    return newPost;
  }

  async updateOnePostById(blogId: string, blogName: string, postId: string, updatePostDto: UpdatePostDto) {
    const postForUpdate: PostUpdateModel = {
      title: updatePostDto.title,
      shortDescription: updatePostDto.shortDescription,
      content: updatePostDto.content,
      blogId,
      blogName,
    };
    return this.postRepository.updateOnePostById(postId, postForUpdate);
  }

  async deleteOnePostById(postId: string) {
    return this.postRepository.deleteOnePostById(postId);
  }
}
