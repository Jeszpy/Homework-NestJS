import { Injectable } from '@nestjs/common';
import { Reaction, ReactionStatusEnum } from '../models/reaction.schema';
import { ReactionRepositoryMongodb } from '../infrastructure/reaction.repository.mongodb';

@Injectable()
export class ReactionService {
  constructor(private readonly reactionRepository: ReactionRepositoryMongodb) {}

  async updateReactionByParentId(
    parentId: string,
    userId: string,
    userLogin: string,
    reactionStatus: ReactionStatusEnum,
  ) {
    const newReaction: Reaction = {
      parentId,
      userId,
      userLogin,
      reactionStatus,
      addedAt: new Date().toISOString(),
    };
    return this.reactionRepository.updateReactionByParentId({ ...newReaction });
  }
}
