import { IsString, IsUUID, Length, Validate } from 'class-validator';
import { Transform } from 'class-transformer';
import { BlogExists } from '../../../decorators/validation/blog-exist.decorator';

export class CreatePostDto {
  @IsString()
  @Transform(({ value }) => value.trim())
  @Length(1, 30)
  title: string;
  @IsString()
  @Transform(({ value }) => value.trim())
  @Length(1, 100)
  shortDescription: string;
  @IsString()
  @Transform(({ value }) => value.trim())
  @Length(1, 1000)
  content: string;
  @IsUUID()
  @BlogExists()
  blogId: string;
}
