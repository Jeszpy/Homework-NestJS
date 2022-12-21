import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Session, SessionDocument } from '../models/session.schema';
import { Model } from 'mongoose';
import { SessionViewModel } from '../models/session-view.model';

@Injectable()
export class SessionQueryRepositoryMongodb {
  constructor(
    @InjectModel(Session.name)
    private readonly sessionModel: Model<SessionDocument>,
  ) {}
  async findOneByDeviceAndUserIdAndDate(
    deviceId: string,
    userId: string,
    lastActiveDate: string,
  ): Promise<Session | null> {
    console.log(deviceId, userId, lastActiveDate);
    const a = await this.sessionModel.findOne({
      deviceId,
      userId,
      lastActiveDate,
    });
    console.log(a);
    return a;
  }

  async findOneByDeviceIdAndDate(
    deviceId: string,
    lastActiveDate: string,
  ): Promise<Session | null> {
    return this.sessionModel.findOne({ deviceId, lastActiveDate });
  }

  async findOneByDeviceId(deviceId: string): Promise<Session | null> {
    return this.sessionModel.findOne({ deviceId });
  }

  async findOneByDeviceAndUserId(
    deviceId: string,
    userId: string,
  ): Promise<Session | null> {
    return this.sessionModel.findOne({ deviceId, userId });
  }

  async findAllDevicesByUserId(userId: string): Promise<SessionViewModel[]> {
    return this.sessionModel.find(
      { userId },
      { _id: 0, ip: 1, title: 1, lastActiveDate: 1, deviceId: 1 },
    );
  }
}
