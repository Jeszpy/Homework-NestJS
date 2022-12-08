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
    const status = exception.getStatus();

    if (status === 400) {
      const errorResponse = {
        errorsMessages: [],
      };
      const responseBody: any = exception.getResponse();

      try {
        responseBody.message.forEach((m) =>
          errorResponse.errorsMessages.push(m),
        );
        return response.status(status).send(errorResponse);
      } catch (e) {
        return response.sendStatus(status);
      }
    } else {
      return response.sendStatus(status);
    }
    // if (status === 401) return response.redirect('/login');
    // if (status === 401) return response.sendStatus(status);
    // if (status === 404) return response.sendStatus(status);
    // if (status === 429) return response.sendStatus(status);
  }
}

export const GlobalHttpExceptionFilter = new HttpExceptionFilter();
