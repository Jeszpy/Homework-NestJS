import {
  Body,
  Controller,
  Get,
  HttpCode,
  Ip,
  NotFoundException,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from '../application/auth.service';
import { LoginDto } from '../dto/login.dto';
import { BearerAuthGuard } from '../../../guards/bearer-auth.guard';
import { User } from '../../../decorators/param/user.decorator';
import { UserEntity } from '../../user/models/user.schema';
import { RegistrationDto } from '../dto/registration.dto';
import { RegistrationEmailResendingDto } from '../dto/registration-email-resending.dto';
import { RegistrationConfirmationDto } from '../dto/registration-confirmation.dto';
import { UserAgent } from '../../../decorators/param/user-agent.decorator';
import { RefreshTokenGuard } from '../../../guards/refresh-token.guard';
import { SessionInfo } from '../../../decorators/param/session.decorator';
import { SessionInfoDto } from '../../session/dto/sessionInfoDto';
// import { Session } from '../../../decorators/param/session.decorator';
// import { CreateSessionDto } from '../../session/dto/createSessionDto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(200)
  async login(
    @Body() loginDto: LoginDto,
    @Ip() ip: string,
    @UserAgent() userAgent: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { accessToken, refreshToken } = await this.authService.login(
      loginDto,
      ip,
      userAgent,
    );
    res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: true });
    return { accessToken };
  }

  @UseGuards(RefreshTokenGuard)
  @Post('refresh-token')
  @HttpCode(200)
  async refreshToken(
    @User() user: UserEntity,
    @SessionInfo() sessionInfo: SessionInfoDto,
    @Res({ passthrough: true })
    res: Response,
  ) {
    const { accessToken, refreshToken } = await this.authService.refreshToken(
      user.id,
      sessionInfo,
    );
    res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: true });
    return { accessToken };
  }

  @Post('registration')
  @HttpCode(204)
  async registration(@Body() registrationDto: RegistrationDto) {
    return this.authService.registration(registrationDto);
  }

  @Post('registration-email-resending')
  @HttpCode(204)
  async registrationEmailResending(
    @Body() registrationEmailResendingDto: RegistrationEmailResendingDto,
  ) {
    return this.authService.registrationEmailResending(
      registrationEmailResendingDto.email,
    );
  }

  @Post('registration-confirmation')
  @HttpCode(204)
  async registrationConfirmation(
    @Body() registrationConfirmationDto: RegistrationConfirmationDto,
  ) {
    return this.authService.registrationConfirmation(
      registrationConfirmationDto.code,
    );
  }

  @UseGuards(RefreshTokenGuard)
  @Post('logout')
  @HttpCode(204)
  async logout(
    @User() user: UserEntity,
    @SessionInfo() sessionInfo: SessionInfoDto,
  ) {
    return this.authService.logout(user.id, sessionInfo.deviceId);
  }

  @UseGuards(BearerAuthGuard)
  @Get('/me')
  @HttpCode(200)
  async aboutMe(@User() user: UserEntity) {
    return {
      userId: user.id,
      login: user.accountData.login,
      email: user.accountData.email,
    };
  }
}
