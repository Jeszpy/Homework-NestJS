import { Module } from '@nestjs/common';
import { AuthService } from './application/auth.service';
import { AuthController } from './api/auth.controller';
import { UserRepositoryMongodb } from '../user/infrastructure/user.repository.mongodb';
import { UserQueryRepositoryMongodb } from '../user/infrastructure/user-query.repository.mongodb';
import { UserService } from '../user/application/user.service';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../user/models/user.schema';

const schemas = [{ name: User.name, schema: UserSchema }];

@Module({
  imports: [MongooseModule.forFeature(schemas)],
  controllers: [AuthController],
  providers: [
    AuthService,
    UserService,
    UserRepositoryMongodb,
    UserQueryRepositoryMongodb,
  ],
})
export class AuthModule {}
