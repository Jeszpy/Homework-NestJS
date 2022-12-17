import { Controller, Get, HttpCode, UseGuards } from '@nestjs/common';
import { SessionQueryRepositoryMongodb } from '../session/infrastructure/session-query.repository.mongodb';
import { RefreshTokenGuard } from '../../guards/refresh-token.guard';
import { User } from '../../decorators/param/user.decorator';
import { UserEntity } from '../user/models/user.schema';
import { SessionViewModel } from '../session/models/session-view.model';

@Controller('security')
export class SecurityController {
  constructor(
    private readonly sessionQueryRepository: SessionQueryRepositoryMongodb,
  ) {}

  @UseGuards(RefreshTokenGuard)
  @Get('devices')
  @HttpCode(200)
  async getAllUserDevices(
    @User() user: UserEntity,
  ): Promise<SessionViewModel[]> {
    return this.sessionQueryRepository.findAllDevicesByUserId(user.id);
  }
}
