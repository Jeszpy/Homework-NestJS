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
} from '@nestjs/common';
import { PostService } from '../application/post.service';
import { CreatePostDto } from '../dto/create-post.dto';
import { UpdatePostDto } from '../dto/update-post.dto';
import { PostQueryRepositoryMongodb } from '../infrastructure/post-query.repository.mongodb';
import { BasicAuthGuard } from '../../../guards/basic-auth.guard';

@Controller('posts')
export class PostController {
  constructor(
    private readonly postService: PostService,
    private readonly postQueryRepository: PostQueryRepositoryMongodb,
  ) {}

  @Post()
  @HttpCode(201)
  @UseGuards(BasicAuthGuard)
  createNewPost(@Body() createPostDto: CreatePostDto) {
    return this.postService.createNewPost(createPostDto);
  }

  @Get()
  getAllPosts() {
    return this.postQueryRepository.getAllPosts();
  }

  @Get(':id')
  async getOnePostById(@Param('id') id: string) {
    const post = await this.postQueryRepository.getOnePostById(id);
    if (!post) throw new NotFoundException();
    return post;
  }

  @Put(':id')
  @UseGuards(BasicAuthGuard)
  @HttpCode(204)
  async updateOnePostById(
    @Param('id') id: string,
    @Body() updatePostDto: UpdatePostDto,
  ) {
    const isUpdated = await this.postService.updateOnePostById(
      id,
      updatePostDto,
    );
    if (!isUpdated) throw new NotFoundException();
    return;
  }

  @Delete(':id')
  @UseGuards(BasicAuthGuard)
  @HttpCode(204)
  async deleteOnePostById(@Param('id') id: string) {
    const isDeleted = await this.postService.deleteOnePostById(id);
    if (!isDeleted) throw new NotFoundException();
    return;
  }
}
