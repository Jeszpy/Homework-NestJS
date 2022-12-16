import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Session, SessionDocument } from '../models/session.schema';
import { Model } from 'mongoose';

@Injectable()
export class SessionRepositoryMongodb {
  constructor(
    @InjectModel(Session.name)
    private readonly sessionModel: Model<SessionDocument>,
  ) {}

  async updateSessionInfo(newSessionInfo: Session) {
    try {
      return this.sessionModel.updateOne(
        { deviceId: newSessionInfo.deviceId, userId: newSessionInfo.userId },
        {
          $set: {
            userId: newSessionInfo.userId,
            deviceId: newSessionInfo.deviceId,
            ip: newSessionInfo.ip,
            title: newSessionInfo.title,
            lastActiveDate: newSessionInfo.lastActiveDate,
          },
        },
        { upsert: true },
      );
    } catch (e) {
      return null;
    }
  }

  async deleteAllSessionExceptCurrent() {}

  async deleteOneSessionByUserAndDeviceId(
    userId: string,
    deviceId: string,
  ): Promise<boolean> {
    try {
      await this.sessionModel.deleteOne({ userId, deviceId });
      return true;
    } catch (e) {
      return false;
    }
  }
}
