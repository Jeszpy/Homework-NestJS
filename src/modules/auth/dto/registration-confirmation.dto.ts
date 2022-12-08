import { IsString, IsUUID } from 'class-validator';

export class RegistrationConfirmationDto {
  @IsString()
  @IsUUID()
  code: string;
}
