import { Injectable } from '@nestjs/common';
import { SessionRepositoryMongodb } from '../infrastructure/session.repository.mongodb';
import { SessionInfoDto } from '../dto/sessionInfoDto';
import { SessionQueryRepositoryMongodb } from '../infrastructure/session-query.repository.mongodb';

@Injectable()
export class SessionService {
  constructor(
    private readonly sessionRepository: SessionRepositoryMongodb,
    private readonly sessionQueryRepository: SessionQueryRepositoryMongodb,
  ) {}

  async createOrUpdateSessionInfo(sessionInfo: SessionInfoDto) {
    return this.sessionRepository.updateSessionInfo(sessionInfo);
  }

  async deleteOneSessionByUserAndDeviceId(
    userId: string,
    deviceId: string,
  ): Promise<boolean> {
    return this.sessionRepository.deleteOneSessionByUserAndDeviceId(
      userId,
      deviceId,
    );
  }

  async deleteOneDeviceByDeviceAndUserIdAndDate(
    sessionInfo: SessionInfoDto,
    userId: string,
  ) {
    return this.sessionRepository.deleteOneSessionByUserAndDeviceIdAndDate(
      userId,
      sessionInfo,
    );
  }

  async deleteAllSessionExceptCurrent(
    sessionInfo: SessionInfoDto,
    userId: string,
  ) {
    return this.sessionRepository.deleteAllSessionExceptCurrent(
      userId,
      sessionInfo,
    );
  }
}
