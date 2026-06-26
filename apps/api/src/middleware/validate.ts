import type { Request, Response, NextFunction } from "express";
import { type ZodSchema, ZodError } from "zod";

/**
 * Validates request body against a Zod schema.
 * Returns 400 with field-level errors on failure.
 */
export function validate(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid request data",
            details: error.flatten().fieldErrors,
          },
        });
        return;
      }
      next(error);
    }
  };
}
