import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { Error } from 'mongoose';
import ValidationError = Error.ValidationError;

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    // In certain situations `httpAdapter` might not be available in the
    // constructor method, thus we should resolve it here.
    const { httpAdapter } = this.httpAdapterHost;

    const ctx = host?.switchToHttp();

    let httpStatus =
      exception instanceof HttpException
        ? exception?.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;
    let message =
      exception instanceof HttpException
        ? exception.message
        : 'Internal server error';
    let errorName =
      exception instanceof Error || exception instanceof HttpException
        ? exception.name
        : 'Internal server error';
    if (exception instanceof BadRequestException) {
      message = exception?.message;
      errorName = 'BadRequestException';
      httpStatus = exception?.getStatus();
    }
    if (exception instanceof ValidationError) {
      message = '';
      let counter = 1;
      for (let specificErrors of Object.values(exception.errors)) {
        let sE = specificErrors as any;
        message += `${counter++} - ${sE?.properties?.message}`;
      }
      if (message == '') {
        message = 'Internal Server Error';
      }
      httpStatus = 400; //this is a bad request!
    }

    if (exception instanceof BadRequestException) {
      //TODO: here i need to put the check
      let errors = exception.getResponse() as any;

      if (errors?.validationErrors) {
        message = '';
        Object.keys(errors?.validationErrors)?.forEach((key) => {
          if (Array.isArray(errors?.validationErrors?.[key])) {
            message += `${key} - ${errors?.validationErrors?.[key]?.join(',')}`;
            //TODO: NEED TO WORK ON NESTED ERRORS
            // let errItem = errors?.validationErrors?.[key];
            // if (Array.isArray(errItem)) {
            //   errItem?.forEach(i => {
            //     Object.entries(i).forEach(entry => {
            //       message += `${key} -> ${entry?.[0]} - ${entry[1]} `;
            //     });
            //   });
            // } else {
            //   message += `${key} - ${errors?.validationErrors?.[key]?.join(
            //     ','
            //   )}`;
            // }
          } else {
            Object.keys(errors?.validationErrors?.[key])?.forEach((key2) => {
              if (Array.isArray(errors?.validationErrors?.[key]?.[key2])) {
                message += `${key2} - ${errors?.validationErrors?.[key]?.[
                  key2
                ]?.join(',')}`;
              }
            });
          }
        });
        if (message == '') {
          message = 'Internal Server Error';
        }
        httpStatus = 400; //this is a bad request!
      }
    }

    const responseBody = {
      statusCode: httpStatus,
      message,
      timestamp: new Date().toISOString(),
      path: httpAdapter.getRequestUrl(ctx.getRequest()),
      method: ctx?.getRequest().method,
      errorName,
    };

    httpAdapter.reply(ctx.getResponse(), responseBody, httpStatus);
  }
}
