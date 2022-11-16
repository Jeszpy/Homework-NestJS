import { IsString, IsUrl, Length } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateBlogDto {
  @IsString()
  @Transform(({ value }) => value.trim)
  @Length(1, 15)
  name: string;
  @IsString()
  @IsUrl()
  @Length(1, 100)
  youtubeUrl: string;
}
