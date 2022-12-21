import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { BadRequestException, Injectable } from '@nestjs/common';

@ValidatorConstraint({ name: 'Trim' })
export class TrimValidator implements ValidatorConstraintInterface {
  validate(value: string) {
    try {
      const result = value.trim();
      return result.length > 0;
    } catch (e) {
      console.log(e);
      throw new BadRequestException();
    }
  }

  defaultMessage(args: ValidationArguments) {
    return "This field can't be empty";
  }
}
