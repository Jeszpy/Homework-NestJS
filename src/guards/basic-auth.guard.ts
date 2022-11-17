import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class BasicAuthGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const auth = request.headers.authorization;
    if (!auth) throw new UnauthorizedException();
    const authType = auth.split(' ')[0];
    if (authType !== 'Basic') throw new UnauthorizedException();
    const authPayload = auth.split(' ')[1];
    const authDecodedPayload = Buffer.from(authPayload, 'base64').toString();
    if (authDecodedPayload !== 'admin:qwerty')
      throw new UnauthorizedException();
    return true;
  }
}
