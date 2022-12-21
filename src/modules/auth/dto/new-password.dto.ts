import { IsNotEmpty, IsString, IsUUID, Length } from 'class-validator';

export class NewPasswordDto {
  @Length(6, 20)
  @IsNotEmpty()
  @IsString()
  newPassword: string;

  @IsUUID()
  @IsString()
  recoveryCode: string;
}
