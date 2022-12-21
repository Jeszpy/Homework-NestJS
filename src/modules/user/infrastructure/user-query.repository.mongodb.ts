import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { UserEntity, UserDocument } from '../models/user.schema';
import { Model } from 'mongoose';
import { UserPaginationQueryDto } from '../../../helpers/pagination/dto/user-pagination-query.dto';
import { PaginationViewModel } from '../../../helpers/pagination/pagination-view-model.mapper';
import { UserViewModel } from '../models/user-view-model';

@Injectable()
export class UserQueryRepositoryMongodb {
  constructor(
    @InjectModel(UserEntity.name)
    private readonly userModel: Model<UserDocument>,
  ) {}

  async findAllUsers(
    userPaginationQueryDto: UserPaginationQueryDto,
  ): Promise<PaginationViewModel<UserViewModel[]>> {
    const filter = {
      $or: [
        {
          'accountData.login': {
            $regex: userPaginationQueryDto.searchLoginTerm ?? '',
            $options: 'i',
          },
        },
        {
          'accountData.email': {
            $regex: userPaginationQueryDto.searchEmailTerm ?? '',
            $options: 'i',
          },
        },
      ],
    };
    const users: UserViewModel[] = await this.userModel.aggregate([
      { $match: filter },
      {
        $sort: {
          [`accountData.${userPaginationQueryDto.sortBy}`]:
            userPaginationQueryDto.sortDirection === 'asc' ? 1 : -1,
        },
      },
      {
        $skip:
          (userPaginationQueryDto.pageNumber - 1) *
          userPaginationQueryDto.pageSize,
      },
      { $limit: userPaginationQueryDto.pageSize },
      {
        $project: {
          _id: false,
          id: true,
          login: '$accountData.login',
          email: '$accountData.email',
          createdAt: '$accountData.createdAt',
        },
      },
    ]);
    const totalCount = await this.userModel.countDocuments(filter);
    return new PaginationViewModel<UserViewModel[]>(
      totalCount,
      userPaginationQueryDto.pageNumber,
      userPaginationQueryDto.pageSize,
      users,
    );
  }

  async findUserByLogin(login: string): Promise<UserEntity | null> {
    return this.userModel.findOne(
      { 'accountData.login': login },
      { _id: false },
    );
  }

  async findUserByEmail(email: string): Promise<UserEntity | null> {
    return this.userModel.findOne(
      { 'accountData.email': email },
      { _id: false },
    );
  }

  async findUserByLoginOrEmail(
    loginOrEmail: string,
  ): Promise<UserEntity | null> {
    return this.userModel.findOne(
      {
        $or: [
          { 'accountData.login': loginOrEmail },
          { 'accountData.email': loginOrEmail },
        ],
      },
      { _id: false },
    );
  }

  async findUserById(userId: string) {
    return this.userModel.findOne({ id: userId }, { _id: false });
  }

  async findUserByConfirmationCode(code: string) {
    return this.userModel.findOne({
      'emailInfo.confirmationCode': code,
    });
  }

  async findUserByPasswordRecoveryCode(
    recoveryCode: string,
  ): Promise<UserEntity | null> {
    return this.userModel.findOne(
      {
        'passwordRecoveryInfo.isConfirmed': false,
        'passwordRecoveryInfo.recoveryCode': recoveryCode,
      },
      { _id: false },
    );
  }
}
