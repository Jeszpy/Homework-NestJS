import { IsEmail, IsString, Length } from 'class-validator';
import { UserLoginExist } from '../../../decorators/validation/user-login-exist.decorator';
import { UserEmailExist } from '../../../decorators/validation/user-email-exist.decorator';
import { Transform } from 'class-transformer';

export class CreateUserDto {
  @Length(3, 10)
  @IsString()
  @UserLoginExist()
  login: string;
  @IsEmail()
  @UserEmailExist()
  email: string;
  @Length(6, 20)
  @IsString()
  password: string;
}
