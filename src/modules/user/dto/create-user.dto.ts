import { IsEmail, IsString, Length } from 'class-validator';
import { UserLoginExist } from '../../../decorators/validation/user-login-exist.decorator';
import { UserEmailExist } from '../../../decorators/validation/user-email-exist.decorator';
import { Transform } from 'class-transformer';

export class CreateUserDto {
  @Length(3, 10)
  @IsString()
  @UserLoginExist()
  @Transform(({ value }) => {
    console.log('CreateUserDto => login:', value);
    return {};
  })
  login: string;
  @IsEmail()
  @UserEmailExist()
  @Transform(({ value }) => {
    console.log('CreateUserDto => email:', value);
    return {};
  })
  email: string;
  @Length(6, 20)
  @IsString()
  @Transform(({ value }) => {
    console.log('CreateUserDto => password:', value);
    return {};
  })
  password: string;
}
