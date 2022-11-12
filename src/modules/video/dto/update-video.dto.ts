import { CreateVideoDto } from './create-video.dto';
import {
  IsBoolean,
  IsDateString,
  IsInt,
  Max,
  Min,
  ValidateIf,
} from 'class-validator';

export class UpdateVideoDto extends CreateVideoDto {
  @IsBoolean()
  canBeDownloaded: boolean;
  @ValidateIf((object, value) => value !== null)
  @IsInt()
  @Min(1)
  @Max(18)
  minAgeRestriction: null | number;
  @IsDateString()
  publicationDate: string;
}
