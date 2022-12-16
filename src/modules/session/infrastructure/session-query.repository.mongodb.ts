import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Session, SessionDocument } from '../models/session.schema';
import { Model } from 'mongoose';

@Injectable()
export class SessionQueryRepositoryMongodb {
  constructor(
    @InjectModel(Session.name)
    private readonly sessionModel: Model<SessionDocument>,
  ) {}
  async findOneByDeviceAndUserId(
    deviceId: string,
    userId: string,
  ): Promise<Session | null> {
    return this.sessionModel.findOne({ deviceId, userId });
  }
}
