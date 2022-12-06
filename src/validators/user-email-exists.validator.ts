import { Injectable } from '@nestjs/common';
import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { UserQueryRepositoryMongodb } from '../modules/user/infrastructure/user-query.repository.mongodb';

@ValidatorConstraint({ name: 'UserEmailExists', async: true })
@Injectable()
export class UserEmailExistsValidator implements ValidatorConstraintInterface {
  constructor(
    private readonly userQueryRepositoryMongodb: UserQueryRepositoryMongodb,
  ) {}

  async validate(email: string) {
    try {
      const user = await this.userQueryRepositoryMongodb.findUserByEmail(email);
      if (user) return false;
      return true;
    } catch (e) {
      return false;
    }
  }

  defaultMessage(args: ValidationArguments) {
    return 'This email already exists';
  }
}
