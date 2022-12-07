import { Module } from '@nestjs/common';
import { UserService } from './application/user.service';
import { UserController } from './api/user.controller';
import { UserRepositoryMongodb } from './infrastructure/user.repository.mongodb';
import { UserQueryRepositoryMongodb } from './infrastructure/user-query.repository.mongodb';
import { MongooseModule } from '@nestjs/mongoose';
import { UserEntity, UserSchema } from './models/user.schema';
import { UserLoginExistsValidator } from '../../validators/user-login-exists.validator';
import { UserEmailExistsValidator } from '../../validators/user-email-exists.validator';

const schemas = [{ name: UserEntity.name, schema: UserSchema }];

@Module({
  imports: [MongooseModule.forFeature(schemas)],
  controllers: [UserController],
  providers: [
    UserService,
    UserRepositoryMongodb,
    UserQueryRepositoryMongodb,
    UserLoginExistsValidator,
    UserEmailExistsValidator,
  ],
})
export class UserModule {}
