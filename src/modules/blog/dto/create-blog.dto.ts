import { IsString, IsUrl, MaxLength } from 'class-validator';
import { Trim } from '../../../decorators/validation/trim.decorator';

export class CreateBlogDto {
  @MaxLength(15, { message: 'len' })
  @Trim()
  @IsString()
  name: string;
  @MaxLength(500)
  @Trim()
  @IsString()
  description: string;
  @IsString()
  @IsUrl()
  @Trim()
  @MaxLength(100)
  websiteUrl: string;
}
