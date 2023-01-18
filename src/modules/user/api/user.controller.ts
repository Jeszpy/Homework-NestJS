import { Controller, Post, Body, Param, Delete, UseGuards, Get, Query, HttpCode, Put, Inject } from '@nestjs/common';
import { UserService } from '../application/user.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { BasicAuthGuard } from '../../../guards/basic-auth.guard';
import { UserPaginationQueryDto } from '../../../helpers/pagination/dto/user-pagination-query.dto';
import { PaginationViewModel } from '../../../helpers/pagination/pagination-view-model.mapper';
import { UserViewModel } from '../models/user-view-model';
import { UserQueryRepositoryMongodb } from '../infrastructure/user-query.repository.mongodb';
import { SkipThrottle } from '@nestjs/throttler';
import { BanUserDto } from '../dto/ban-user.dto';
import { BlogPaginationQueryDto } from '../../../helpers/pagination/dto/blog-pagination-query.dto';
import { IBlogQueryRepository, IBlogQueryRepositoryKey } from '../../blog/interfaces/IBlogQueryRepository';
import { BlogBySaViewModel } from '../../blog/models/blog-by-sa-view-model';

@SkipThrottle()
@UseGuards(BasicAuthGuard)
@Controller('sa')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly userQueryRepository: UserQueryRepositoryMongodb,
    @Inject(IBlogQueryRepositoryKey)
    private readonly blogQueryRepository: IBlogQueryRepository,
  ) {}

  @Get('/blogs')
  async getBlogsBySA(@Query() blogPaginationQueryDto: BlogPaginationQueryDto): Promise<PaginationViewModel<BlogBySaViewModel[]>> {
    return this.blogQueryRepository.getAllBlogsBySA(blogPaginationQueryDto);
  }

  @Get('/users')
  async getAllUsers(@Query() userPaginationQueryDto: UserPaginationQueryDto): Promise<PaginationViewModel<UserViewModel[]>> {
    return this.userQueryRepository.findAllUsers(userPaginationQueryDto);
  }

  @Post('/users')
  @HttpCode(201)
  async createUser(@Body() createUserDto: CreateUserDto): Promise<UserViewModel> {
    return this.userService.createUser(createUserDto);
  }

  @Delete('/users/:userId')
  @HttpCode(204)
  async deleteUserById(@Param('userId') userId: string) {
    return this.userService.deleteUserById(userId);
  }

  @Put('/users/:userId/ban')
  @HttpCode(204)
  async banOrUnbanUser(@Param('userId') userId: string, @Body() banUserDto: BanUserDto) {
    return this.userService.banOrUnbanUser(userId, banUserDto);
  }
}
