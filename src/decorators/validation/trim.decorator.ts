import { registerDecorator, ValidationOptions } from 'class-validator';
import { TrimValidator } from '../../validators/trim.validator';

export function Trim(validationOptions?: ValidationOptions) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      name: 'Trim',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: TrimValidator,
    });
  };
}
