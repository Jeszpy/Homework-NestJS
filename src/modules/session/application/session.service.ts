import { Injectable } from '@nestjs/common';
import { SessionRepositoryMongodb } from '../infrastructure/session.repository.mongodb';
import { SessionInfoDto } from '../dto/sessionInfoDto';

@Injectable()
export class SessionService {
  constructor(private readonly sessionRepository: SessionRepositoryMongodb) {}

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
}
