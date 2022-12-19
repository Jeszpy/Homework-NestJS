import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { RefreshTokenJwtPayloadDto } from '../../modules/auth/dto/refresh-token-jwt-payload.dto';

export const RefreshTokenJwtPayload = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): RefreshTokenJwtPayloadDto => {
    const request = ctx.switchToHttp().getRequest();
    return request.refreshTokenJWTPayload;
  },
);
