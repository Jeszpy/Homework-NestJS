import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { ReactionStatusEnum } from '../../reaction/models/reaction.schema';

@Schema({ id: false, versionKey: false })
export class LikesInfo {
  @Prop({ required: true, type: Number })
  likesCount: number;
  @Prop({ required: true, type: Number })
  dislikesCount: number;
  @Prop({ required: true, type: String, enum: ReactionStatusEnum })
  myStatus: ReactionStatusEnum;
}

export const LikesInfoSchema = SchemaFactory.createForClass(LikesInfo);

export type CommentDocument = HydratedDocument<Comment>;

@Schema({ id: false, versionKey: false })
export class Comment {
  @Prop({ required: true, unique: true, type: String })
  id: string;
  @Prop({ required: true, type: String })
  parentId: string;
  @Prop({ required: true, type: String })
  content: string;
  @Prop({ required: true, type: String })
  userId: string;
  @Prop({ required: true, type: String })
  userLogin: string;
  @Prop({ required: true, type: String })
  createdAt: string;
  @Prop({ required: true, type: LikesInfoSchema })
  likesInfo: LikesInfo;
}

export const CommentSchema = SchemaFactory.createForClass(Comment);
