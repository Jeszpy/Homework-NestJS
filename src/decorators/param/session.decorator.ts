import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { SessionInfoDto } from '../../modules/session/dto/sessionInfoDto';

export const SessionInfo = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): SessionInfoDto => {
    const request = ctx.switchToHttp().getRequest();
    return request.sessionInfo;
  },
);
