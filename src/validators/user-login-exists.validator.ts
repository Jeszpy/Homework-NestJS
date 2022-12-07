import { Injectable } from '@nestjs/common';
import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { UserQueryRepositoryMongodb } from '../modules/user/infrastructure/user-query.repository.mongodb';

@ValidatorConstraint({ name: 'UserLoginExists', async: true })
@Injectable()
export class UserLoginExistsValidator implements ValidatorConstraintInterface {
  constructor(
    private readonly userQueryRepositoryMongodb: UserQueryRepositoryMongodb,
  ) {}

  async validate(login: string) {
    try {
      const user = await this.userQueryRepositoryMongodb.findUserByLogin(login);
      if (user) return false;
      return true;
    } catch (e) {
      return false;
    }
  }

  defaultMessage(args: ValidationArguments) {
    return 'This login already exists';
  }
}
