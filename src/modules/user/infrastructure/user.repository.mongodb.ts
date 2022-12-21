import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserEntity, UserDocument } from '../models/user.schema';

@Injectable()
export class UserRepositoryMongodb {
  constructor(
    @InjectModel(UserEntity.name)
    private readonly userModel: Model<UserDocument>,
  ) {}

  async createUser(newUser: UserEntity) {
    return this.userModel.create({ ...newUser });
  }

  async deleteOneUserById(id: string) {
    return this.userModel.findOneAndDelete({ id });
  }

  async updateConfirmationCodeByUserId(
    userId: string,
    newConfirmationCode: string,
  ) {
    return this.userModel.updateOne(
      { id: userId },
      { $set: { 'emailInfo.confirmationCode': newConfirmationCode } },
    );
  }

  async confirmUserEmailByUserId(userId: string) {
    return this.userModel.updateOne(
      { id: userId },
      {
        $set: {
          'emailInfo.isConfirmed': true,
        },
      },
    );
  }

  async updateRecoveryPasswordInfo(userId: string, recoveryCode: string) {
    return this.userModel.updateOne(
      { userId },
      {
        $set: {
          'passwordRecoveryInfo.isConfirmed': false,
          'passwordRecoveryInfo.recoveryCode': recoveryCode,
        },
      },
    );
  }

  async updateUserPasswordByUserId(userId: string, newHashedPassword: string) {
    return this.userModel.updateOne(
      { userId },
      {
        $set: {
          'accountData.passwordHash': newHashedPassword,
          'passwordRecoveryInfo.isConfirmed': true,
          'passwordRecoveryInfo.recoveryCode': null,
        },
      },
    );
  }
}
