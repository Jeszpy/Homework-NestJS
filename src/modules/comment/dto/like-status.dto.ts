import { ReactionStatusEnum } from '../../reaction/models/reaction.schema';
import { IsEnum, IsString } from 'class-validator';

export class LikeStatusDto {
  @IsEnum(ReactionStatusEnum)
  @IsString()
  likeStatus: ReactionStatusEnum;
}
