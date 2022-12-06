import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../models/user.schema';

@Injectable()
export class UserRepositoryMongodb {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  async createUser(newUser: User) {
    return this.userModel.create({ ...newUser });
  }

  async deleteOneUserById(id: string) {
    return this.userModel.findOneAndDelete({ id });
  }
}
