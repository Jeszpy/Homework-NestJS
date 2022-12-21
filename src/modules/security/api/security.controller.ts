import { Controller, Delete, Get, HttpCode, UseGuards } from '@nestjs/common';
import { SessionQueryRepositoryMongodb } from '../../session/infrastructure/session-query.repository.mongodb';
import { RefreshTokenGuard } from '../../../guards/refresh-token.guard';
import { User } from '../../../decorators/param/user.decorator';
import { UserEntity } from '../../user/models/user.schema';
import { SessionViewModel } from '../../session/models/session-view.model';
import { SessionInfo } from '../../../decorators/param/session.decorator';
import { SessionInfoDto } from '../../session/dto/sessionInfoDto';
import { SessionService } from '../../session/application/session.service';
import { RefreshTokenJwtPayloadDto } from '../../auth/dto/refresh-token-jwt-payload.dto';
import { RefreshTokenJwtPayload } from '../../../decorators/param/refresh-token-jwt-payload.decorator';

@Controller('security')
export class SecurityController {
  constructor(
    private readonly sessionService: SessionService,
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

  @UseGuards(RefreshTokenGuard)
  @Delete('devices/:deviceId')
  @HttpCode(204)
  async deleteOneDeviceById(
    @RefreshTokenJwtPayload()
    refreshTokenJwtPayloadDto: RefreshTokenJwtPayloadDto,
  ) {
    return this.sessionService.deleteOneSessionByUserAndDeviceId(
      refreshTokenJwtPayloadDto.userId,
      refreshTokenJwtPayloadDto.deviceId,
    );
  }

  @UseGuards(RefreshTokenGuard)
  @Delete('devices')
  @HttpCode(204)
  async deleteAllSessionExceptCurrent(
    @User() user: UserEntity,
    @RefreshTokenJwtPayload()
    refreshTokenJwtPayloadDto: RefreshTokenJwtPayloadDto,
  ) {
    return this.sessionService.deleteAllSessionExceptCurrent(
      refreshTokenJwtPayloadDto,
    );
  }
}
