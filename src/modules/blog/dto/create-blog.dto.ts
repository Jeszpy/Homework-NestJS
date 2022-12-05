import { IsString, IsUrl, MaxLength } from 'class-validator';
import { Trim } from '../../../decorators/validation/trim.decorator';

export class CreateBlogDto {
  @IsString()
  @Trim()
  @MaxLength(15)
  name: string;
  @IsString()
  @Trim()
  @MaxLength(500)
  description: string;
  @IsString()
  @IsUrl()
  @Trim()
  @MaxLength(100)
  websiteUrl: string;
}
