import { registerDecorator, ValidationOptions } from 'class-validator';
import { UserEmailExistsValidator } from '../../validators/user-email-exists.validator';

export function UserEmailExist(validationOptions?: ValidationOptions) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      name: 'UserEmailExists',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: UserEmailExistsValidator,
    });
  };
}
