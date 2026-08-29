import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { ErrorResponseDto } from '../dto/error-response.dto.js';

/**
 * Global fallback exception filter.
 *
 * Catches anything not already handled by a module-specific filter
 * (`filters/` under each module) and formats it into the standard error
 * shape, so no unhandled error ever reaches the client as a raw stack
 * trace or a bare framework response.
 */
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const statusCode =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const exceptionResponse =
      exception instanceof HttpException ? exception.getResponse() : undefined;

    const { message, error } = HttpExceptionFilter.normalize(
      exceptionResponse,
      statusCode,
      exception,
    );

    const body: ErrorResponseDto = {
      statusCode,
      message,
      error,
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    response.status(statusCode).json(body);
  }

  private static normalize(
    exceptionResponse: string | object | undefined,
    statusCode: number,
    exception: unknown,
  ): Pick<ErrorResponseDto, 'message' | 'error'> {
    // Nest's built-in HttpExceptions (NotFoundException, etc.) already
    // produce a { statusCode, message, error } body — reuse it as-is.
    if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
      const { message, error } = exceptionResponse as Record<string, unknown>;
      return {
        message: (message as string | string[]) ?? 'Unexpected error',
        error:
          typeof error === 'string'
            ? error
            : HttpExceptionFilter.reasonPhrase(statusCode),
      };
    }

    if (typeof exceptionResponse === 'string') {
      return {
        message: exceptionResponse,
        error: HttpExceptionFilter.reasonPhrase(statusCode),
      };
    }

    // Anything that isn't an HttpException at all (programming errors, etc.)
    return {
      message:
        exception instanceof Error
          ? exception.message
          : 'Internal server error',
      error: HttpExceptionFilter.reasonPhrase(statusCode),
    };
  }

  private static reasonPhrase(statusCode: number): string {
    const key = HttpStatus[statusCode] as string | undefined;
    if (!key) return 'Error';
    return key
      .toLowerCase()
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }
}
