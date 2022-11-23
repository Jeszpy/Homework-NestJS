import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type BlogDocument = HydratedDocument<Blog>;

@Schema({ id: false, versionKey: false })
export class Blog {
  @Prop({ required: true, unique: true, type: String })
  id: string;

  @Prop({ required: true, type: String })
  name: string;

  @Prop({ required: true, type: String })
  description: string;

  @Prop({ required: true, type: String })
  websiteUrl: string;

  @Prop({ required: true, type: String })
  createdAt: string;
}

export const BlogSchema = SchemaFactory.createForClass(Blog);
