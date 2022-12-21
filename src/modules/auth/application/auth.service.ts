import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { LoginDto } from '../dto/login.dto';
import { UserService } from '../../user/application/user.service';
import { JwtService } from './jwt.service';
import { RegistrationDto } from '../dto/registration.dto';
import { EmailService } from '../../email/email.service';
import { UserQueryRepositoryMongodb } from '../../user/infrastructure/user-query.repository.mongodb';
import { UserRepositoryMongodb } from '../../user/infrastructure/user.repository.mongodb';
import { randomUUID } from 'crypto';
import { SessionService } from '../../session/application/session.service';
import { SessionInfoDto } from '../../session/dto/sessionInfoDto';
import { Session } from '../../session/models/session.schema';
import { SessionQueryRepositoryMongodb } from '../../session/infrastructure/session-query.repository.mongodb';
import { RefreshTokenJwtPayloadDto } from '../dto/refresh-token-jwt-payload.dto';
import { SessionRepositoryMongodb } from '../../session/infrastructure/session.repository.mongodb';
import { NewPasswordDto } from '../dto/new-password.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly userQueryRepository: UserQueryRepositoryMongodb,
    private readonly userRepository: UserRepositoryMongodb,
    private readonly jwtService: JwtService,
    private readonly sessionService: SessionService,
    private readonly sessionRepository: SessionRepositoryMongodb,
    private readonly sessionQueryRepository: SessionQueryRepositoryMongodb,
    private readonly emailService: EmailService,
  ) {}

  async login(loginDto: LoginDto, ip: string, userAgent: string) {
    const user = await this.userService.validateUserByLoginOrEmail(
      loginDto.loginOrEmail,
      loginDto.password,
    );
    const deviceId = randomUUID();
    const { accessToken, refreshToken } =
      await this.jwtService.signAccessAndRefreshTokenToken(user.id, deviceId);
    const lastActiveDate = await this.jwtService.getIssuedAtFromRefreshToken(
      refreshToken,
    );
    const sessionInfo: Session = {
      ip,
      title: userAgent,
      lastActiveDate,
      deviceId,
      userId: user.id,
    };
    await this.sessionService.createNewSession(sessionInfo);
    return { accessToken, refreshToken };
  }

  async registration(registrationDto: RegistrationDto) {
    const user = await this.userService.registerUser(registrationDto);
    await this.emailService.sendRegistrationEmail(
      user.accountData.email,
      user.accountData.login,
      user.emailInfo.confirmationCode,
    );
    return;
  }

  async registrationEmailResending(email: string) {
    const user = await this.userQueryRepository.findUserByEmail(email);
    if (!user) throw new BadRequestException('userNotExist');
    if (user.emailInfo.isConfirmed)
      throw new BadRequestException('codeAlreadyConfirmed');
    const newConfirmationCode = randomUUID();
    await this.userRepository.updateConfirmationCodeByUserId(
      user.id,
      newConfirmationCode,
    );
    await this.emailService.sendEmailWithNewConfirmationCode(
      user.accountData.email,
      user.accountData.login,
      newConfirmationCode,
    );
    return;
  }

  async registrationConfirmation(code: string) {
    return this.userService.confirmUserEmail(code);
  }

  async refreshToken(token: string) {
    const jwtPayload = this.jwtService.verifyRefreshToken(token);
    if (!jwtPayload) return null;
    const userId = jwtPayload.userId;
    const deviceId = jwtPayload.deviceId;
    const lastActiveDate = new Date(jwtPayload.iat * 1000).toISOString();
    const user = await this.userQueryRepository.findUserById(userId);
    if (!user) return null;
    const device =
      await this.sessionQueryRepository.findOneByDeviceAndUserIdAndDate(
        deviceId,
        userId,
        lastActiveDate,
      );
    if (!device) return null;
    const { accessToken, refreshToken } =
      await this.jwtService.signAccessAndRefreshTokenToken(userId, deviceId);
    const newLastActiveDate = await this.jwtService.getIssuedAtFromRefreshToken(
      refreshToken,
    );
    await this.sessionService.updateSessionAfterRefreshToken(
      userId,
      deviceId,
      newLastActiveDate,
    );
    return { accessToken, refreshToken };
  }

  async logout(
    userId: string,
    refreshTokenJWTPayload: RefreshTokenJwtPayloadDto,
  ) {
    const lastActiveDate = new Date(
      refreshTokenJWTPayload.iat * 1000,
    ).toISOString();
    return this.sessionRepository.deleteOneSessionByUserAndDeviceIdAndDate(
      userId,
      refreshTokenJWTPayload.deviceId,
      lastActiveDate,
    );
  }

  async passwordRecovery(email: string) {
    const user = await this.userQueryRepository.findUserByLoginOrEmail(email);
    if (!user) return null;
    const recoveryCode = await this.userService.recoveryPassword(user.id);
    return this.emailService.sendPasswordRecoveryCode(
      user.accountData.email,
      user.accountData.login,
      recoveryCode,
    );
  }

  async newPassword(newPasswordDto: NewPasswordDto) {
    const user = await this.userQueryRepository.findUserByPasswordRecoveryCode(
      newPasswordDto.recoveryCode,
    );
    if (!user) throw new BadRequestException();
    return this.userService.updatePasswordByUserId(
      user.id,
      newPasswordDto.newPassword,
    );
  }
}
