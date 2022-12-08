import {
  Body,
  Controller,
  Get,
  HttpCode,
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

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(200)
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const accessToken = await this.authService.login(loginDto);
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
