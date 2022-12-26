import { IsBoolean, IsString, MinLength } from 'class-validator';

export class BanUserDto {
  @IsBoolean()
  isBanned: boolean;
  @MinLength(20)
  @IsString()
  banReason: string;
}
