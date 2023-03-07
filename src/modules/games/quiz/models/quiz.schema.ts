import { HydratedDocument } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ReactionStatusEnum } from '../../../reaction/models/reaction.schema';

export enum AnswerStatusEnum {
  Correct = 'Correct',
  Incorrect = 'Incorrect',
}

export enum QuizGameStatusEnum {
  PendingSecondPlayer = 'PendingSecondPlayer',
  Active = 'Active',
  Finished = 'Finished',
}

@Schema({ _id: false, id: false, versionKey: false })
class Answer {
  @Prop({ required: true, type: String })
  questionId: string;
  @Prop({ required: true, type: String, enum: AnswerStatusEnum })
  answerStatus: AnswerStatusEnum;
  @Prop({ required: true, type: String })
  addedAt: string;
}

const AnswerSchema = SchemaFactory.createForClass(Answer);

@Schema({ _id: false, id: false, versionKey: false })
class PlayerInfo {
  @Prop({ required: true, type: String, index: true })
  id: string;
  @Prop({ required: true, type: String })
  login: string;
}

const PlayerInfoSchema = SchemaFactory.createForClass(PlayerInfo);

@Schema({ _id: false, id: false, versionKey: false })
export class Question {
  @Prop({ required: true, type: String })
  id: string;
  @Prop({ required: true, type: String })
  body: string;
  @Prop({ required: true, type: [String] })
  correctAnswers: string[];
}

const QuestionSchema = SchemaFactory.createForClass(Question);

@Schema({ _id: false, id: false, versionKey: false })
export class PlayerProgress {
  @Prop({ required: true, type: [AnswerSchema] })
  answers: Answer[];
  @Prop({ required: true, type: PlayerInfoSchema })
  player: PlayerInfo;
  @Prop({ required: true, type: Number })
  score: number;
}

const PlayerProgressSchema = SchemaFactory.createForClass(PlayerProgress);

export type QuizGameDocument = HydratedDocument<QuizGame>;

@Schema({ id: false, versionKey: false })
export class QuizGame {
  @Prop({ required: true, type: String, index: true })
  id: string;
  @Prop({ required: true, type: PlayerProgressSchema })
  firstPlayerProgress: PlayerProgress;
  @Prop({ type: PlayerProgressSchema })
  secondPlayerProgress: PlayerProgress;
  @Prop({ required: true, type: [QuestionSchema] })
  questions: Question[];
  @Prop({ required: true, type: String, enum: QuizGameStatusEnum })
  status: QuizGameStatusEnum;
  @Prop({ required: true, type: String })
  pairCreatedDate: string;
  @Prop({ type: String })
  startGameDate: string;
  @Prop({ type: String })
  finishGameDate: string;
}

export const QuizGameSchema = SchemaFactory.createForClass(QuizGame);
