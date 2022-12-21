import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtService } from '../modules/auth/application/jwt.service';

@Injectable()
export class GetUserIdFromBearerToken implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const auth = request.headers.authorization;
    if (!auth) {
      request.userId = null;
      return true;
    }
    const authType = auth.split(' ')[0];
    if (authType !== 'Bearer') {
      request.userId = null;
      return true;
    }
    const accessToken = auth.split(' ')[1];
    if (!accessToken) {
      request.userId = null;
      return true;
    }
    const payload = this.jwtService.getPayloadFromAccessToken(accessToken);
    if (!payload) {
      request.userId = null;
      return true;
    }
    request.userId = payload.userId;
    return true;
  }
}
