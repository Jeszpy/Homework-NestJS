import { IsString, Length } from 'class-validator';

export class UpdateCommentDto {
  @IsString()
  @Length(20, 300)
  content: string;
}
