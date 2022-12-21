import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { SessionRepositoryMongodb } from '../infrastructure/session.repository.mongodb';
import { SessionInfoDto } from '../dto/sessionInfoDto';
import { SessionQueryRepositoryMongodb } from '../infrastructure/session-query.repository.mongodb';
import { Session } from '../models/session.schema';
import { RefreshTokenJwtPayloadDto } from '../../auth/dto/refresh-token-jwt-payload.dto';

@Injectable()
export class SessionService {
  constructor(
    private readonly sessionRepository: SessionRepositoryMongodb,
    private readonly sessionQueryRepository: SessionQueryRepositoryMongodb,
  ) {}

  async createNewSession(newSession: Session) {
    return this.sessionRepository.createNewSession(newSession);
  }

  // async createOrUpdateSessionInfo(sessionInfo: Session) {
  //   return this.sessionRepository.updateSessionInfo(sessionInfo);
  // }

  async deleteOneSessionByUserAndDeviceId(userId: string, deviceId: string) {
    const session = await this.sessionQueryRepository.findOneByDeviceId(
      deviceId,
    );
    if (!session) throw new NotFoundException();
    if (session.userId !== userId) throw new ForbiddenException();
    return this.sessionRepository.deleteOneSessionByUserAndDeviceId(
      userId,
      deviceId,
    );
  }
  //
  // async deleteOneDeviceByDeviceAndUserIdAndDate(
  //   sessionInfo: SessionInfoDto,
  //   userId: string,
  // ) {
  //   return this.sessionRepository.deleteOneSessionByUserAndDeviceIdAndDate(
  //     userId,
  //     sessionInfo,
  //   );
  // }
  //
  async deleteAllSessionExceptCurrent(
    refreshTokenJwtPayloadDto: RefreshTokenJwtPayloadDto,
  ) {
    return this.sessionRepository.deleteAllSessionExceptCurrent(
      refreshTokenJwtPayloadDto.userId,
      refreshTokenJwtPayloadDto.deviceId,
    );
  }

  async updateSessionAfterRefreshToken(
    userId: string,
    deviceId: string,
    newLastActiveDate: string,
  ) {
    return this.sessionRepository.updateSessionAfterRefreshToken(
      userId,
      deviceId,
      newLastActiveDate,
    );
  }
}
