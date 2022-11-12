import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsIn,
  IsNotEmpty,
  IsString,
  Length,
} from 'class-validator';
import { videoAvailableResolutions } from '../models/video.schema';

export class CreateVideoDto {
  // @ApiProperty({ minLength: 1, maxLength: 40 })
  @IsString()
  @IsNotEmpty()
  @Length(1, 40)
  title: string;
  // @ApiProperty({ minLength: 1, maxLength: 20 })
  @IsString()
  @IsNotEmpty()
  @Length(1, 20)
  author: string;
  // @ApiProperty({ nullable: true, enum: videoAvailableResolutions })
  @IsArray({})
  @ArrayMinSize(0)
  @ArrayMaxSize(videoAvailableResolutions.length)
  @IsIn(videoAvailableResolutions, { each: true })
  availableResolutions: typeof videoAvailableResolutions;
}
