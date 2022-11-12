import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(HttpException)
class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    // const request = ctx.getRequest<Request>();
    const status = exception.getStatus();

    if (status === 400) {
      const errorResponse = {
        errorsMessages: [],
      };

      const responseBody: any = exception.getResponse();
      responseBody.message.forEach((m) => errorResponse.errorsMessages.push(m));
      return response.status(status).send(errorResponse);
    }
    if (status === 401) {
      return response.sendStatus(401);
    }
    if (status === 404) return response.sendStatus(404);
  }
}

export const GlobalHttpExceptionFilter = new HttpExceptionFilter();
