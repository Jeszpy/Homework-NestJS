import { HydratedDocument } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export enum QuestionPublishedStatusEnum {
  All = 'all',
  Published = 'published',
  NotPublished = 'notPublished',
}

export type QuizQuestionDocument = HydratedDocument<QuizQuestion>;

@Schema({ id: false, versionKey: false, timestamps: true })
export class QuizQuestion {
  @Prop({ required: true, type: String, index: true })
  id: string;
  @Prop({ required: true, type: String })
  body: string;
  @Prop({ required: true })
  correctAnswers: any[];
  @Prop({ required: true, type: String, enum: QuestionPublishedStatusEnum })
  published: QuestionPublishedStatusEnum;
  createdAt: string;
  updatedAt: string;
}

export const QuizQuestionSchema = SchemaFactory.createForClass(QuizQuestion);
