import { IsEmail, IsString } from 'class-validator';

export class RegistrationEmailResendingDto {
  @IsEmail()
  email: string;
}
