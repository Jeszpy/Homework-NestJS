import { Inject, Injectable } from '@nestjs/common';
import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { IBlogQueryRepository } from '../modules/blog/interfaces/IBlogQueryRepository';

@ValidatorConstraint({ name: 'BlogExists', async: true })
@Injectable()
export class BlogExistsValidator implements ValidatorConstraintInterface {
  constructor(
    @Inject(IBlogQueryRepository)
    private blogQueryRepository: IBlogQueryRepository,
  ) {}

  async validate(id: string) {
    try {
      const blog = await this.blogQueryRepository.getOneBlogById(id);
      if (!blog) return false;
    } catch (e) {
      return false;
    }
    return true;
  }

  defaultMessage(args: ValidationArguments) {
    return "Blog doesn't exist";
  }
}
