import { CreatePostWithBlogIdDto } from './create-post.dto';
import { IsString, MaxLength } from 'class-validator';
import { Trim } from '../../../decorators/validation/trim.decorator';

// export class UpdatePostDto extends CreatePostWithBlogIdDto {}

export class UpdatePostDto {
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
