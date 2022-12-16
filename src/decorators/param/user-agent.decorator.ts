import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const UserAgent = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): { userAgent: string } => {
    const request = ctx.switchToHttp().getRequest();
    return request.get('User-Agent');
  },
);
