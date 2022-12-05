import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { Injectable } from '@nestjs/common';

@ValidatorConstraint({ name: "This field can't be empty" })
@Injectable()
export class TrimValidator implements ValidatorConstraintInterface {
  validate(value: string) {
    try {
      const result = value.trim();
      return result.length > 0;
    } catch (e) {
      return false;
    }
  }

  defaultMessage(args: ValidationArguments) {
    return "This field can't be empty";
  }
}
