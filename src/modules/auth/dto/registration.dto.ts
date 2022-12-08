import { IsEmail, IsString, Length } from 'class-validator';
import { UserLoginExist } from '../../../decorators/validation/user-login-exist.decorator';
import { UserEmailExist } from '../../../decorators/validation/user-email-exist.decorator';

export class RegistrationDto {
  @IsString()
  @Length(3, 10)
  @UserLoginExist()
  login: string;
  @IsEmail()
  @UserEmailExist()
  email: string;
  @IsString()
  @Length(6, 20)
  password: string;
}
