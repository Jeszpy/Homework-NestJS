import { PlayerProgress, Question, QuizGame, QuizGameStatusEnum } from './quiz.schema';

export class QuizGameViewModel {
  id: string;
  firstPlayerProgress: PlayerProgress;
  secondPlayerProgress: PlayerProgress;
  questions: Question[];
  status: QuizGameStatusEnum;
  pairCreatedDate: string;
  startGameDate: string;
  finishGameDate: string;
  constructor(quizGame: QuizGame) {
    this.id = quizGame.id;
    this.firstPlayerProgress = quizGame.firstPlayerProgress;
    this.secondPlayerProgress = quizGame.secondPlayerProgress;
    this.questions = quizGame.questions;
    this.status = quizGame.status;
    this.pairCreatedDate = quizGame.pairCreatedDate;
    this.startGameDate = quizGame.startGameDate;
    this.finishGameDate = quizGame.finishGameDate;
  }
}
