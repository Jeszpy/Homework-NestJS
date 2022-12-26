import {
  Controller,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Get,
  Query,
  HttpCode,
} from '@nestjs/common';
import { UserService } from '../application/user.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { BasicAuthGuard } from '../../../guards/basic-auth.guard';
import { UserPaginationQueryDto } from '../../../helpers/pagination/dto/user-pagination-query.dto';
import { PaginationViewModel } from '../../../helpers/pagination/pagination-view-model.mapper';
import { UserViewModel } from '../models/user-view-model';
import { UserQueryRepositoryMongodb } from '../infrastructure/user-query.repository.mongodb';
import { SkipThrottle } from '@nestjs/throttler';

@SkipThrottle()
@UseGuards(BasicAuthGuard)
@Controller('users')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly userQueryRepositoryMongodb: UserQueryRepositoryMongodb,
  ) {}

  @Get()
  async getAllUsers(
    @Query() userPaginationQueryDto: UserPaginationQueryDto,
  ): Promise<PaginationViewModel<UserViewModel[]>> {
    return this.userQueryRepositoryMongodb.findAllUsers(userPaginationQueryDto);
  }

  @Post()
  @HttpCode(201)
  async createUser(
    @Body() createUserDto: CreateUserDto,
  ): Promise<UserViewModel> {
    return this.userService.createUser(createUserDto);
  }

  @Delete(':userId')
  @HttpCode(204)
  async deleteUserById(@Param('userId') userId: string) {
    return this.userService.deleteUserById(userId);
  }
}
