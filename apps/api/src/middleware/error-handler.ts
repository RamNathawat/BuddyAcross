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
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  const statusCode = err && typeof err === "object" && "statusCode" in err ? err.statusCode : 500;
  const code = err && typeof err === "object" && "code" in err ? err.code : "INTERNAL_ERROR";
  
  let message = err?.message || err?.error?.message;
  if (!message) {
    if (typeof err === "string") message = err;
    else if (err?.error && typeof err.error === "object") message = err.error.message || JSON.stringify(err.error);
    else message = JSON.stringify(err);
  }

  console.error(`[ERROR] ${code}: ${message}`);
  if (statusCode === 500) {
    console.error(err?.stack || err);
  }

  res.status(statusCode).json({
    success: false,
    error: {
      code,
      message: statusCode === 500 && !err?.statusCode ? "An unexpected error occurred" : message,
    },
  });
}
