import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Session, SessionDocument } from '../models/session.schema';
import { Model } from 'mongoose';
import { SessionInfoDto } from '../dto/sessionInfoDto';

@Injectable()
export class SessionRepositoryMongodb {
  constructor(
    @InjectModel(Session.name)
    private readonly sessionModel: Model<SessionDocument>,
  ) {}

  async createNewSession(newSessionInfo: Session) {
    return this.sessionModel.create({ ...newSessionInfo });
  }

  async updateSessionAfterRefreshToken(
    userId: string,
    deviceId: string,
    newLastActiveDate: string,
  ) {
    return this.sessionModel.updateOne(
      { userId, deviceId },
      { $set: { lastActiveDate: newLastActiveDate } },
    );
  }

  async deleteOneSessionByUserAndDeviceIdAndDate(
    userId: string,
    deviceId: string,
    lastActiveDate: string,
  ) {
    return this.sessionModel.findOneAndDelete({
      userId,
      deviceId,
      lastActiveDate,
    });
  }
}
