import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

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
}

export const CommentSchema = SchemaFactory.createForClass(Comment);
