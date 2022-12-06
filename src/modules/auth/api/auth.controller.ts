import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { AuthService } from '../application/auth.service';
import { LoginDto } from '../dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(204)
  async login(@Body() loginDto: LoginDto): Promise<boolean> {
    console.log('tuk-tuk');
    return this.authService.login(loginDto);
  }
}
