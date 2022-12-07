import { Injectable } from '@nestjs/common';
import { LoginDto } from '../dto/login.dto';
import { UserService } from '../../user/application/user.service';
import { JwtService } from './jwt.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto): Promise<string> {
    const user = await this.userService.validateUserByLoginOrEmail(
      loginDto.loginOrEmail,
      loginDto.password,
    );
    return this.jwtService.signAccessToken(user.id);
  }
}
