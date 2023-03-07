import { CreateQuizQuestionDto } from '../dto/create-quiz-question.dto';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { QuestionPublishedStatusEnum, QuizQuestion, QuizQuestionDocument } from '../models/quiz-question.schema';
import { randomUUID } from 'crypto';
import { QuizQuestionViewModel } from '../models/quiz-question.view-model';

export class QuizCreateNewQuestionCommand {
  constructor(readonly createQuizQuestionDto: CreateQuizQuestionDto) {}
}

@CommandHandler(QuizCreateNewQuestionCommand)
export class QuizCreateNewQuestionUseCase implements ICommandHandler<QuizCreateNewQuestionCommand> {
  constructor(@InjectModel(QuizQuestion.name) private readonly quizQuestionModel: Model<QuizQuestionDocument>) {}

  async execute(command: QuizCreateNewQuestionCommand) {
    const { createQuizQuestionDto } = command;
    const newQuestion = new this.quizQuestionModel();
    newQuestion.id = randomUUID();
    newQuestion.body = createQuizQuestionDto.body;
    newQuestion.correctAnswers = createQuizQuestionDto.correctAnswers;
    newQuestion.published = QuestionPublishedStatusEnum.NotPublished;
    await newQuestion.save();
    return new QuizQuestionViewModel(newQuestion);
  }
}
