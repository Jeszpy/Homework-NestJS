import { Module } from '@nestjs/common';
import { SessionService } from './application/session.service';
import { SessionRepositoryMongodb } from './infrastructure/session.repository.mongodb';
import { SessionQueryRepositoryMongodb } from './infrastructure/session-query.repository.mongodb';
import { Session, SessionSchema } from './models/session.schema';
import { MongooseModule } from '@nestjs/mongoose';

const schemas = [{ name: Session.name, schema: SessionSchema }];

@Module({
  imports: [MongooseModule.forFeature(schemas)],
  providers: [
    SessionService,
    SessionRepositoryMongodb,
    SessionQueryRepositoryMongodb,
  ],
  exports: [
    SessionService,
    SessionRepositoryMongodb,
    SessionQueryRepositoryMongodb,
  ],
})
export class SessionModule {}
