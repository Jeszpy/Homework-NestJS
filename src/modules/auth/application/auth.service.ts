import { Injectable } from '@nestjs/common';
import { LoginDto } from '../dto/login.dto';
import { UserService } from '../../user/application/user.service';

@Injectable()
export class AuthService {
  constructor(private readonly userService: UserService) {}
  async login(loginDto: LoginDto): Promise<boolean> {
    return this.userService.validateUserByLoginOrEmail(
      loginDto.loginOrEmail,
      loginDto.password,
    );
  }
}
