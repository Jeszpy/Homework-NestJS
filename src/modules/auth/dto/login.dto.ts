import { IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @IsString()
  @IsNotEmpty()
  loginOrEmail: string;
  @IsString()
  @IsNotEmpty()
  password: string;
}
