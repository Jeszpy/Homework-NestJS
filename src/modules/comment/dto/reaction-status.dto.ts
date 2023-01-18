import { ReactionStatusEnum } from '../../reaction/models/reaction.schema';
import { IsEnum, IsString } from 'class-validator';

export class ReactionStatusDto {
  @IsEnum(ReactionStatusEnum)
  @IsString()
  likeStatus: ReactionStatusEnum;
}
