import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { QuestionPublishedStatusEnum, QuizQuestion, QuizQuestionDocument } from '../models/quiz-question.schema';
import { FilterQuery, Model } from 'mongoose';
import { QuestionPaginationQueryDto } from '../../../../helpers/pagination/dto/question-pagination-query.dto';
import { PaginationViewModel } from '../../../../helpers/pagination/pagination-view-model.mapper';
import { QuizQuestionViewModel } from '../models/quiz-question.view-model';

export class QuizGetAllQuestionsCommand {
  constructor(readonly questionPaginationQueryDto: QuestionPaginationQueryDto) {}
}

@CommandHandler(QuizGetAllQuestionsCommand)
export class QuizGetAllQuestionsUseCase implements ICommandHandler<QuizGetAllQuestionsCommand> {
  constructor(@InjectModel(QuizQuestion.name) private readonly quizQuestionModel: Model<QuizQuestionDocument>) {}

  async execute(command: QuizGetAllQuestionsCommand): Promise<PaginationViewModel<QuizQuestionViewModel[]>> {
    const { questionPaginationQueryDto } = command;

    const filter = this.getFilter(questionPaginationQueryDto);
    const questions = await this.quizQuestionModel
      .find(filter, { _id: false })
      .sort({ [questionPaginationQueryDto.sortBy]: questionPaginationQueryDto.sortDirection === 'asc' ? 1 : -1 })
      .skip((questionPaginationQueryDto.pageNumber - 1) * questionPaginationQueryDto.pageSize)
      .limit(questionPaginationQueryDto.pageSize)
      .lean();
    const countOfQuestions = await this.quizQuestionModel.countDocuments(filter);
    return new PaginationViewModel(countOfQuestions, questionPaginationQueryDto.pageNumber, questionPaginationQueryDto.pageSize, questions);
  }

  private getFilter(questionPaginationQueryDto: QuestionPaginationQueryDto): FilterQuery<QuizQuestion> {
    const publishedFilter =
      questionPaginationQueryDto.publishedStatus === QuestionPublishedStatusEnum.All
        ? { $or: [{ published: QuestionPublishedStatusEnum.Published }, { published: QuestionPublishedStatusEnum.NotPublished }] }
        : { published: questionPaginationQueryDto.publishedStatus };
    return {
      $and: [{ $regex: { body: questionPaginationQueryDto.bodySearchTerm ?? '', $options: 'i' } }, publishedFilter],
    };
  }
}
