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
