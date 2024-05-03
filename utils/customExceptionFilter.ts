import { ExceptionFilter, Catch, ArgumentsHost, HttpStatus } from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class CustomExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const statusCode =  exception.getStatus();
    let message =  exception.response.message ?? exception.getResponse();
    response.status(statusCode).json({
      statusCode,
      message,
    });
  }
}