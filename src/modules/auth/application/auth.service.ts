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

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly userQueryRepository: UserQueryRepositoryMongodb,
    private readonly userRepository: UserRepositoryMongodb,
    private readonly jwtService: JwtService,
    private readonly sessionService: SessionService,
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
    const sessionInfo: SessionInfoDto = {
      ip,
      title: userAgent,
      lastActiveDate,
      deviceId,
      userId: user.id,
    };
    await this.sessionService.createOrUpdateSessionInfo(sessionInfo);
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

  async refreshToken(userId: string, sessionInfo: SessionInfoDto) {
    const { accessToken, refreshToken } =
      await this.jwtService.signAccessAndRefreshTokenToken(
        userId,
        sessionInfo.deviceId,
      );
    const lastActiveDate = await this.jwtService.getIssuedAtFromRefreshToken(
      refreshToken,
    );
    const session = {
      ...sessionInfo,
      lastActiveDate,
    };
    await this.sessionService.createOrUpdateSessionInfo(session);
    return { accessToken, refreshToken };
  }

  async logout(userId: string, deviceId: string): Promise<boolean> {
    const result = await this.sessionService.deleteOneSessionByUserAndDeviceId(
      userId,
      deviceId,
    );
    if (!result) throw new NotFoundException();
    return;
  }
}
