import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '../modules/auth/application/jwt.service';
import { UserQueryRepositoryMongodb } from '../modules/user/infrastructure/user-query.repository.mongodb';
import { SessionQueryRepositoryMongodb } from '../modules/session/infrastructure/session-query.repository.mongodb';

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
    const jwtPayload = await this.jwtService.verifyRefreshToken(refreshToken);
    if (!jwtPayload) throw new UnauthorizedException();
    const user = await this.userQueryRepository.findUserById(jwtPayload.userId);
    if (!user) throw new UnauthorizedException();
    const lastActiveDate = new Date(jwtPayload.iat * 1000).toISOString();
    // const session =
    //   await this.sessionQueryRepository.findOneByDeviceAndUserIdAndDate(
    //     jwtPayload.deviceId,
    //     user.id,
    //     lastActiveDate,
    //   );

    const session = await this.sessionQueryRepository.findOneByDeviceIdAndDate(
      jwtPayload.deviceId,
      lastActiveDate,
    );
    if (!session) throw new NotFoundException();
    if (session.userId !== user.id) throw new ForbiddenException();
    request.user = user;
    request.sessionInfo = {
      ip: request.ip,
      title: request.get('User-Agent'),
      lastActiveDate,
      deviceId: session.deviceId,
      userId: user.id,
    };
    return true;
  }
}
