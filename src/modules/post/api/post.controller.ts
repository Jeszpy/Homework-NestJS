import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Put,
  HttpCode,
  NotFoundException,
  Query,
} from '@nestjs/common';
import { PostService } from '../application/post.service';
import { CreatePostWithBlogIdDto } from '../dto/create-post.dto';
import { UpdatePostDto } from '../dto/update-post.dto';
import { PostQueryRepositoryMongodb } from '../infrastructure/post-query.repository.mongodb';
import { BasicAuthGuard } from '../../../guards/basic-auth.guard';
import { PostPaginationQueryDto } from '../../../helpers/pagination/dto/post-pagination-query.dto';
import { BearerAuthGuard } from '../../../guards/bearer-auth.guard';
import { UserEntity } from '../../user/models/user.schema';
import { User } from '../../../decorators/param/user.decorator';
import { CommentService } from '../../comment/application/comment.service';
import { CreateCommentDto } from '../../comment/dto/create-comment.dto';
import { CommentQueryRepositoryMongodb } from '../../comment/infrastructure/comment-query.repository.mongodb';
import { CommentPaginationQueryDto } from '../../../helpers/pagination/dto/comment-pagination-query.dto';
import { PaginationViewModel } from '../../../helpers/pagination/pagination-view-model.mapper';
import { CommentViewModel } from '../../comment/models/comment-view-model';
import { SkipThrottle } from '@nestjs/throttler';
import { GetUserIdFromBearerToken } from '../../../guards/get-userId-from-bearer-token';
import { UserId } from '../../../decorators/param/userId.decorator';

@SkipThrottle()
@Controller('posts')
export class PostController {
  constructor(
    private readonly postService: PostService,
    private readonly commentService: CommentService,
    private readonly postQueryRepository: PostQueryRepositoryMongodb,
    private readonly commentQueryRepository: CommentQueryRepositoryMongodb,
  ) {}

  @UseGuards(BasicAuthGuard)
  @Post()
  @HttpCode(201)
  createNewPost(@Body() createPostWithBlogIdDto: CreatePostWithBlogIdDto) {
    return this.postService.createNewPost(
      createPostWithBlogIdDto.blogId,
      createPostWithBlogIdDto,
    );
  }

  @Get()
  getAllPosts(@Query() postPaginationQueryDto: PostPaginationQueryDto) {
    return this.postQueryRepository.getAllPosts(postPaginationQueryDto);
  }

  @Get(':postId')
  async getOnePostById(@Param('postId') postId: string) {
    const post = await this.postQueryRepository.getOnePostById(postId);
    if (!post) throw new NotFoundException();
    return post;
  }

  @UseGuards(BasicAuthGuard)
  @Put(':postId')
  @HttpCode(204)
  async updateOnePostById(
    @Param('postId') postId: string,
    @Body() updatePostDto: UpdatePostDto,
  ) {
    const isUpdated = await this.postService.updateOnePostById(
      postId,
      updatePostDto,
    );
    if (!isUpdated) throw new NotFoundException();
    return;
  }

  @UseGuards(BasicAuthGuard)
  @Delete(':postId')
  @HttpCode(204)
  async deleteOnePostById(@Param('postId') postId: string) {
    const isDeleted = await this.postService.deleteOnePostById(postId);
    if (!isDeleted) throw new NotFoundException();
    return;
  }

  @UseGuards(GetUserIdFromBearerToken)
  @Get(':postId/comments')
  async getCommentsForPost(
    @Param('postId') postId: string,
    @Query() commentPaginationQueryDto: CommentPaginationQueryDto,
    @UserId() userId: string | null,
  ): Promise<PaginationViewModel<CommentViewModel[]>> {
    const post = await this.postQueryRepository.getOnePostById(postId);
    if (!post) throw new NotFoundException();
    return this.commentQueryRepository.findCommentsByParentId(
      postId,
      commentPaginationQueryDto,
      userId,
    );
  }

  @UseGuards(BearerAuthGuard)
  @Post(':postId/comments')
  @HttpCode(201)
  async createCommentForPostByPostId(
    @Param('postId') postId: string,
    @User() user: UserEntity,
    @Body() createCommentDto: CreateCommentDto,
  ): Promise<CommentViewModel> {
    const post = await this.postQueryRepository.getOnePostById(postId);
    if (!post) throw new NotFoundException();
    return this.commentService.createCommentByParentId(
      postId,
      user,
      createCommentDto.content,
    );
  }
}
