import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { ReactionStatusEnum } from '../../reaction/models/reaction.schema';

@Schema({ id: false, versionKey: false })
class NewestLikes {
  @Prop({ required: true, type: String })
  addedAt: string;
  @Prop({ required: true, type: String })
  userId: string;
  @Prop({ required: true, type: String })
  login: string;
}

export const NewestLikesSchema = SchemaFactory.createForClass(NewestLikes);

@Schema({ id: false, versionKey: false })
export class ExtendedLikesInfo {
  @Prop({ required: true, type: Number })
  likesCount: number;
  @Prop({ required: true, type: Number })
  dislikesCount: number;
  @Prop({ required: true, type: String, enum: ReactionStatusEnum })
  myStatus: ReactionStatusEnum;
  @Prop({ required: true, type: [NewestLikesSchema] })
  newestLikes: NewestLikes[];
}

export const ExtendedLikesInfoSchema =
  SchemaFactory.createForClass(ExtendedLikesInfo);

export type PostDocument = HydratedDocument<Post>;

@Schema({ id: false, versionKey: false })
export class Post {
  @Prop({ required: true, unique: true, type: String })
  id: string;

  @Prop({ required: true, type: String })
  title: string;

  @Prop({ required: true, type: String })
  shortDescription: string;

  @Prop({ required: true, type: String })
  content: string;

  @Prop({ required: true, type: String })
  blogId: string;

  @Prop({ required: true, type: String })
  blogName: string;

  @Prop({ required: true, type: String })
  createdAt: string;

  @Prop({ required: true, type: ExtendedLikesInfoSchema })
  extendedLikesInfo: ExtendedLikesInfo;
}

export const PostSchema = SchemaFactory.createForClass(Post);
