import type { Request, Response, NextFunction } from "express";

export interface AppError extends Error {
  statusCode: number;
  code: string;
}

export function createAppError(
  message: string,
  statusCode: number,
  code: string
): AppError {
  const error = new Error(message) as AppError;
  error.statusCode = statusCode;
  error.code = code;
  return error;
}

/**
 * Global error handler — catches all errors thrown in routes/middleware.
 * Returns a consistent JSON error response.
 */
export function errorHandler(
  err: Error | AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  const statusCode = "statusCode" in err ? err.statusCode : 500;
  const code = "code" in err ? err.code : "INTERNAL_ERROR";

  console.error(`[ERROR] ${code}: ${err.message}`);
  if (statusCode === 500) {
    console.error(err.stack);
  }

  res.status(statusCode).json({
    success: false,
    error: {
      code,
      message:
        statusCode === 500 ? "An unexpected error occurred" : err.message,
    },
  });
}
