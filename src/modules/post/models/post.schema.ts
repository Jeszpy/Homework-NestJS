import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

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
}

export const PostSchema = SchemaFactory.createForClass(Post);
