import { Controller, HttpCode, Post, UseGuards } from '@nestjs/common';
import { BearerAuthGuard } from '../../../../guards/bearer-auth.guard';
import { SkipThrottle } from '@nestjs/throttler';
import { User } from '../../../../decorators/param/user.decorator';
import { UserEntity } from '../../../user/models/user.schema';
import { CommandBus } from '@nestjs/cqrs';
import { QuizConnectionCommand } from '../use-cases/quiz.connection.use-case';
import { QuizGameViewModel } from '../models/quiz.view-model';

@SkipThrottle()
@Controller('pair-game-quiz')
export class QuizGameController {
  constructor(private commandBus: CommandBus) {}

  @UseGuards(BearerAuthGuard)
  @Post('pairs/connection')
  @HttpCode(200)
  async connection(@User() user: UserEntity): Promise<QuizGameViewModel> {
    return this.commandBus.execute(new QuizConnectionCommand(user));
  }
}
