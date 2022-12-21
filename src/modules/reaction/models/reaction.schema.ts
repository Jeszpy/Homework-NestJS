import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export enum ReactionStatusEnum {
  None = 'None',
  Like = 'Like',
  Dislike = 'Dislike',
}

export type ReactionDocument = HydratedDocument<Reaction>;

@Schema({ id: false, versionKey: false })
export class Reaction {
  @Prop({ required: true, type: String })
  parentId: string;
  @Prop({ required: true, type: String })
  userId: string;
  @Prop({ required: true, type: String })
  userLogin: string;
  @Prop({ required: true, type: String, enum: ReactionStatusEnum })
  reactionStatus: ReactionStatusEnum;
  @Prop({ required: true, type: String })
  addedAt: string;
}

export const ReactionSchema = SchemaFactory.createForClass(Reaction);
