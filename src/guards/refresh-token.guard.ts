import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '../modules/auth/application/jwt.service';
import { UserQueryRepositoryMongodb } from '../modules/user/infrastructure/user-query.repository.mongodb';
import { SessionQueryRepositoryMongodb } from '../modules/session/infrastructure/session-query.repository.mongodb';

export const bannedTokens = [];

@Injectable()
export class RefreshTokenGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userQueryRepository: UserQueryRepositoryMongodb,
    private readonly sessionQueryRepository: SessionQueryRepositoryMongodb,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const refreshToken = request.cookies.refreshToken;
    for (const i of bannedTokens) {
      if (refreshToken === i) throw new UnauthorizedException();
    }
    const jwtPayload = await this.jwtService.verifyRefreshToken(refreshToken);
    if (!jwtPayload) throw new UnauthorizedException();
    const user = await this.userQueryRepository.findUserById(jwtPayload.userId);
    if (!user) throw new UnauthorizedException();
    const session = await this.sessionQueryRepository.findOneByDeviceAndUserId(
      jwtPayload.deviceId,
      user.id,
    );
    if (!session) throw new UnauthorizedException();
    bannedTokens.push(refreshToken);
    request.user = user;
    request.sessionInfo = {
      ip: request.ip,
      title: request.get('User-Agent'),
      lastActiveDate: null,
      deviceId: session.deviceId,
      userId: user.id,
    };
    return true;
  }
}
