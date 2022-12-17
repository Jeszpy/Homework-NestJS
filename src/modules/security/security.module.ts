import { Module } from '@nestjs/common';
import { SecurityController } from './security.controller';
import { JwtService } from '../auth/application/jwt.service';
import { UserQueryRepositoryMongodb } from '../user/infrastructure/user-query.repository.mongodb';
import { SessionQueryRepositoryMongodb } from '../session/infrastructure/session-query.repository.mongodb';
import { MongooseModule } from '@nestjs/mongoose';
import { UserEntity, UserSchema } from '../user/models/user.schema';
import { Session, SessionSchema } from '../session/models/session.schema';

const schemas = [
  { name: UserEntity.name, schema: UserSchema },
  { name: Session.name, schema: SessionSchema },
];

@Module({
  imports: [MongooseModule.forFeature(schemas)],
  controllers: [SecurityController],
  providers: [
    JwtService,
    UserQueryRepositoryMongodb,
    SessionQueryRepositoryMongodb,
  ],
})
export class SecurityModule {}