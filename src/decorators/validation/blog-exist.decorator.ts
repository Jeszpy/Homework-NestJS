import { registerDecorator, ValidationOptions } from 'class-validator';
import { BlogExistsValidator } from '../../validators/blog-exists.validator';

export function BlogExists(validationOptions?: ValidationOptions) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      name: 'BlogExists',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: BlogExistsValidator,
    });
  };
}
