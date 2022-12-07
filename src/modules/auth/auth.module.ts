import { Module } from '@nestjs/common';
import { AuthService } from './application/auth.service';
import { AuthController } from './api/auth.controller';
import { UserRepositoryMongodb } from '../user/infrastructure/user.repository.mongodb';
import { UserQueryRepositoryMongodb } from '../user/infrastructure/user-query.repository.mongodb';
import { UserService } from '../user/application/user.service';
import { MongooseModule } from '@nestjs/mongoose';
import { UserEntity, UserSchema } from '../user/models/user.schema';
import { BearerAuthGuard } from '../../guards/bearer-auth.guard';
import { JwtService } from './application/jwt.service';
import { ConfigModule } from '@nestjs/config';

const schemas = [{ name: UserEntity.name, schema: UserSchema }];

@Module({
  imports: [MongooseModule.forFeature(schemas)],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtService,
    UserService,
    UserRepositoryMongodb,
    UserQueryRepositoryMongodb,
  ],
})
export class AuthModule {}
