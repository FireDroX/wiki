/**
 * Standard shape for every error response returned by the API.
 *
 * Module-specific exception filters populate `statusCode`, `message` and
 * `error`. The global fallback filter (`HttpExceptionFilter`) additionally
 * sets `timestamp` and `path`. Reused across all modules — do not create
 * per-module error DTOs.
 */
export class ErrorResponseDto {
  statusCode: number;
  message: string | string[];
  error: string;
  timestamp?: string;
  path?: string;
}
