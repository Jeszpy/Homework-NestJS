import { IsString, IsUUID, MaxLength } from 'class-validator';
import { BlogExists } from '../../../decorators/validation/blog-exist.decorator';
import { Trim } from '../../../decorators/validation/trim.decorator';

export class CreatePostDto {
  @IsString()
  @Trim()
  @MaxLength(30)
  title: string;
  @IsString()
  @Trim()
  @MaxLength(100)
  shortDescription: string;
  @IsString()
  @Trim()
  @MaxLength(1000)
  content: string;
}

export class CreatePostWithBlogIdDto {
  @IsString()
  @Trim()
  @MaxLength(30)
  title: string;
  @IsString()
  @Trim()
  @MaxLength(100)
  shortDescription: string;
  @IsString()
  @Trim()
  @MaxLength(1000)
  content: string;
  @IsString()
  @IsUUID()
  @BlogExists()
  blogId: string;
}
