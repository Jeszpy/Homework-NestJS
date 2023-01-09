import { PartialType } from '@nestjs/mapped-types';
import { CreateBloggerDto } from './create-blogger.dto';

export class UpdateBloggerDto extends PartialType(CreateBloggerDto) {}
