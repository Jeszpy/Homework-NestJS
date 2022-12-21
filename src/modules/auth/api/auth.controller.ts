import {
  Body,
  Controller,
  Get,
  HttpCode,
  Ip,
  Post,
  Res,
  UnauthorizedException,
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
import { RefreshToken } from '../../../decorators/param/refresh-token.decorator';
import { RefreshTokenJwtPayload } from '../../../decorators/param/refresh-token-jwt-payload.decorator';
import { RefreshTokenJwtPayloadDto } from '../dto/refresh-token-jwt-payload.dto';
import { SkipThrottle } from '@nestjs/throttler';
import { RecoveryPasswordDto } from '../dto/recovery-password.dto';
import { NewPasswordDto } from '../dto/new-password.dto';

@SkipThrottle()
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @SkipThrottle(false)
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

  @SkipThrottle(false)
  @Post('password-recovery')
  @HttpCode(204)
  async passwordRecovery(@Body() recoveryPasswordDto: RecoveryPasswordDto) {
    return this.authService.passwordRecovery(recoveryPasswordDto.email);
  }

  @SkipThrottle(false)
  @Post('new-password')
  @HttpCode(204)
  async newPassword(@Body() newPasswordDto: NewPasswordDto) {
    return this.authService.newPassword(newPasswordDto);
  }

  @Post('refresh-token')
  @HttpCode(200)
  async refreshToken(
    @RefreshToken() token: string,
    @Res({ passthrough: true })
    res: Response,
  ) {
    if (!token) throw new UnauthorizedException();
    try {
      const { accessToken, refreshToken } = await this.authService.refreshToken(
        token,
      );
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: true,
      });
      return { accessToken };
    } catch (e) {
      throw new UnauthorizedException();
    }
  }

  @SkipThrottle(false)
  @Post('registration')
  @HttpCode(204)
  async registration(@Body() registrationDto: RegistrationDto) {
    return this.authService.registration(registrationDto);
  }

  @SkipThrottle(false)
  @Post('registration-email-resending')
  @HttpCode(204)
  async registrationEmailResending(
    @Body() registrationEmailResendingDto: RegistrationEmailResendingDto,
  ) {
    return this.authService.registrationEmailResending(
      registrationEmailResendingDto.email,
    );
  }

  @SkipThrottle(false)
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
    @RefreshTokenJwtPayload() refreshTokenJWTPayload: RefreshTokenJwtPayloadDto,
  ) {
    const isDeleted = await this.authService.logout(
      user.id,
      refreshTokenJWTPayload,
    );
    if (!isDeleted) throw new UnauthorizedException();
    return;
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
