import { registerDecorator, ValidationOptions } from 'class-validator';
import { UserLoginExistsValidator } from '../../validators/user-login-exists.validator';

export function UserLoginExist(validationOptions?: ValidationOptions) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      name: 'UserLoginExists',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: UserLoginExistsValidator,
    });
  };
}
