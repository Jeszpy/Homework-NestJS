import { ArrayNotEmpty, IsArray, IsString, Length } from 'class-validator';
import { Trim } from '../../../../decorators/validation/trim.decorator';

export class CreateQuizQuestionDto {
  @Length(10, 500)
  @Trim()
  @IsString()
  body: string;

  @ArrayNotEmpty()
  @IsArray()
  correctAnswers: any[];
}
