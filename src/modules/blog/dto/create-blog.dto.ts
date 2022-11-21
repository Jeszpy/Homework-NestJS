import { IsString, IsUrl, Length } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateBlogDto {
  @IsString()
  @Transform(({ value }) => value.trim())
  @Length(1, 15)
  name: string;
  @IsString()
  @Transform(({ value }) => value.trim())
  @Length(1, 500)
  description: string;
  @IsString()
  @IsUrl()
  @Transform(({ value }) => value.trim())
  @Length(1, 100)
  websiteUrl: string;
}
