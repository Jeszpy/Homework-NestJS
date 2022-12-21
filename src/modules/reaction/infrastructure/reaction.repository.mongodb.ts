import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Reaction, ReactionDocument } from '../models/reaction.schema';
import { Model } from 'mongoose';

@Injectable()
export class ReactionRepositoryMongodb {
  constructor(
    @InjectModel(Reaction.name)
    private readonly reactionModel: Model<ReactionDocument>,
  ) {}

  async updateReactionByParentId(newReaction: Reaction) {
    return this.reactionModel.updateOne(
      { parentId: newReaction.parentId, userId: newReaction.userId },
      { $set: newReaction },
      { upsert: true },
    );
  }
}
