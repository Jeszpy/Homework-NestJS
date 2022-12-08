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

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly userQueryRepository: UserQueryRepositoryMongodb,
    private readonly userRepository: UserRepositoryMongodb,
    private readonly jwtService: JwtService,
    private readonly emailService: EmailService,
  ) {}

  async login(loginDto: LoginDto): Promise<string> {
    const user = await this.userService.validateUserByLoginOrEmail(
      loginDto.loginOrEmail,
      loginDto.password,
    );
    return this.jwtService.signAccessToken(user.id);
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
    if (!user || user.emailInfo.isConfirmed) throw new BadRequestException();
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
}
