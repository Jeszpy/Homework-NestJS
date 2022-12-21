import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
} from 'class-validator';
import { TrimValidator } from '../../validators/trim.validator';

export function Trim(validationOptions?: ValidationOptions) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      name: 'Trim',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: TrimValidator,
      // validator: {
      //   validate(
      //     value: any,
      //     validationArguments?: ValidationArguments,
      //   ): boolean {
      //     try {
      //       console.log('im in decorator');
      //       return value.trim().length > 0;
      //     } catch (e) {
      //       return false;
      //     }
      //   },
      // },
    });
  };
}
