import { QuestionPublishedStatusEnum, QuizQuestion } from './quiz-question.schema';

export class QuizQuestionViewModel {
  id: string;
  body: string;
  correctAnswers: any[];
  published: QuestionPublishedStatusEnum;
  createdAt: string;
  updatedAt: string;
  constructor(question: QuizQuestion) {
    this.id = question.id;
    this.body = question.body;
    this.correctAnswers = question.correctAnswers;
    this.published = question.published;
    this.createdAt = question.createdAt;
    this.updatedAt = question.updatedAt;
  }
}
