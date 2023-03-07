import { Inject, Injectable } from '@nestjs/common';
import { ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';
import { IBlogQueryRepository, IBlogQueryRepositoryKey } from '../modules/blog/interfaces/IBlogQueryRepository';

@ValidatorConstraint({ name: 'BlogExists', async: true })
@Injectable()
export class BlogExistsValidator implements ValidatorConstraintInterface {
  constructor(
    @Inject(IBlogQueryRepositoryKey)
    private blogQueryRepository: IBlogQueryRepository,
  ) {}

  async validate(id: string) {
    try {
      const blog = await this.blogQueryRepository.getBlogById(id);
      return !!blog;
    } catch (e) {
      return false;
    }
  }

  defaultMessage(args: ValidationArguments) {
    return "Blog doesn't exist";
  }
}
