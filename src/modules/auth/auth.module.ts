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
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UserLoginExistsValidator } from '../../validators/user-login-exists.validator';
import { UserEmailExistsValidator } from '../../validators/user-email-exists.validator';
import { MailerModule } from '@nestjs-modules/mailer';
import { EmailModule } from '../email/email.module';
import { SessionModule } from '../session/session.module';

const schemas = [{ name: UserEntity.name, schema: UserSchema }];

@Module({
  imports: [MongooseModule.forFeature(schemas), EmailModule, SessionModule],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtService,
    UserService,
    UserRepositoryMongodb,
    UserQueryRepositoryMongodb,
    // UserLoginExistsValidator,
    // UserEmailExistsValidator,
  ],
})
export class AuthModule {}
