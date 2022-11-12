import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { ValidationError } from 'class-validator';

const prepareErrorResult = (errors: ValidationError[]) => {
  const result = [];
  errors.forEach((e) => {
    const constraintsKeys = Object.keys(e.constraints);
    constraintsKeys.forEach((ckey) => {
      result.push({ message: e.constraints[ckey], field: e.property });
    });
  });
  return result;
};

export const GlobalValidationPipe = new ValidationPipe({
  whitelist: true,
  transform: true,
  stopAtFirstError: true,
  exceptionFactory: (errors: ValidationError[]) => {
    throw new BadRequestException(prepareErrorResult(errors));
  },
});
