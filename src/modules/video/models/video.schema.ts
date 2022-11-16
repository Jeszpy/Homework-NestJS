import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export const videoAvailableResolutions: string[] = [
  'P144',
  'P240',
  'P360',
  'P480',
  'P720',
  'P1080',
  'P1440',
  'P2160',
];

export type VideoDocument = HydratedDocument<Video>;
// export type VideoDocument = Document & Video;

@Schema({ id: false, versionKey: false })
export class Video {
  @Prop({ type: Number, required: true, unique: true })
  id: number;

  @Prop({ type: String, required: true })
  title: string;

  @Prop({ type: String, required: true })
  author: string;

  @Prop({ type: Boolean, default: false })
  canBeDownloaded: boolean;

  @Prop({ type: Number, default: null })
  minAgeRestriction: null | number;

  @Prop({ type: String, required: true })
  createdAt: string;

  @Prop({ type: String, required: true })
  publicationDate: string;

  @Prop({
    type: [String],
    enum: videoAvailableResolutions,
    maxlength: videoAvailableResolutions.length,
    required: true,
  })
  availableResolutions: typeof videoAvailableResolutions;
}

export const VideoSchema = SchemaFactory.createForClass(Video);
