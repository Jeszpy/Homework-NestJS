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
        switch (responseBody.message) {
          case 'name':
            return response.status(400).send({
              errorsMessages: [{ message: 'invalid name', field: 'name' }],
            });
          case 'code':
            return response.status(400).send({
              errorsMessages: [{ message: 'invalid code', field: 'code' }],
            });
          case 'userNotExist':
            return response.status(400).send({
              errorsMessages: [
                { message: 'user email doesnt exist', field: 'email' },
              ],
            });
          case 'codeAlreadyConfirmed':
            return response.status(400).send({
              errorsMessages: [
                { message: ' email already confirmed', field: 'email' },
              ],
            });
          default:
            return response.sendStatus(status);
        }
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
