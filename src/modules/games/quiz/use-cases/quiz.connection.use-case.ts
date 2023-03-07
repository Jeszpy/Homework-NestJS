import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UserEntity } from '../../../user/models/user.schema';
import { InjectModel } from '@nestjs/mongoose';
import { QuizGame, QuizGameDocument, QuizGameStatusEnum } from '../models/quiz.schema';
import { Model } from 'mongoose';
import { ForbiddenException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { QuizGameViewModel } from '../models/quiz.view-model';

export class QuizConnectionCommand {
  constructor(readonly user: UserEntity) {}
}

@CommandHandler(QuizConnectionCommand)
export class QuizConnectionUseCase implements ICommandHandler<QuizConnectionCommand> {
  constructor(@InjectModel(QuizGame.name) private readonly quizGameModel: Model<QuizGameDocument>) {}

  async execute(command: QuizConnectionCommand): Promise<QuizGameViewModel> {
    const { user } = command;
    const activeOrPendingGameForCurrentUser = await this.quizGameModel.findOne({
      $and: [
        { $or: [{ 'firstPlayerProgress.player.id': user.id }, { 'secondPlayerProgress.player.id': user.id }] },
        { $or: [{ status: QuizGameStatusEnum.PendingSecondPlayer }, { status: QuizGameStatusEnum.Active }] },
      ],
    });
    if (activeOrPendingGameForCurrentUser) throw new ForbiddenException();
    const pendingGame = await this.quizGameModel.findOne({ status: QuizGameStatusEnum.PendingSecondPlayer });
    if (!pendingGame) {
      const newGame = await this.createNewGame(user);
      return new QuizGameViewModel(newGame);
    }
    const gameWithTwoPlayers = await this.connectSecondPlayer(user, pendingGame);
    return new QuizGameViewModel(gameWithTwoPlayers);
  }

  private async createNewGame(firstPlayer: UserEntity) {
    const newGame = new this.quizGameModel();
    newGame.id = randomUUID();
    newGame.firstPlayerProgress = {
      answers: [],
      player: {
        id: firstPlayer.id,
        login: firstPlayer.accountData.login,
      },
      score: 0,
    };
    newGame.secondPlayerProgress = null;
    newGame.questions = [];
    newGame.status = QuizGameStatusEnum.PendingSecondPlayer;
    newGame.pairCreatedDate = new Date().toISOString();
    newGame.startGameDate = null;
    newGame.finishGameDate = null;
    await newGame.save();
    return newGame;
  }

  private async connectSecondPlayer(secondPlayer: UserEntity, gameForConnect: QuizGameDocument) {
    gameForConnect.secondPlayerProgress = {
      answers: [],
      player: {
        id: secondPlayer.id,
        login: secondPlayer.accountData.login,
      },
      score: 0,
    };
    gameForConnect.questions = [];
    gameForConnect.status = QuizGameStatusEnum.Active;
    gameForConnect.startGameDate = new Date().toISOString();
    await gameForConnect.save();
    return gameForConnect;
  }
}
