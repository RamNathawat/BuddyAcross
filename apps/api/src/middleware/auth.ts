import type { Request, Response, NextFunction } from "express";
import { supabaseAdmin } from "../config/supabase.js";
import { createAppError } from "./error-handler.js";

/**
 * Extracts and verifies the JWT from the Authorization header.
 * Attaches user info to `req.user`.
 */

export interface AuthUser {
  id: string;
  phone: string;
  role: string;
  kycStatus?: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export async function authenticate(
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
      throw createAppError("Missing or invalid authorization header", 401, "UNAUTHORIZED");
    }

    const token = authHeader.split(" ")[1];

    const {
      data: { user },
      error,
    } = await supabaseAdmin.auth.getUser(token);

    if (error || !user) {
      throw createAppError("Invalid or expired token", 401, "UNAUTHORIZED");
    }

    req.user = {
      id: user.id,
      phone: user.phone || "",
      role: (user.app_metadata?.role as string) || "",
      kycStatus: user.app_metadata?.kyc_status as string | undefined,
    };

    next();
  } catch (error) {
    next(error);
  }
}

export const requireAuth = authenticate;

/**
 * Restricts access to specific roles.
 */
export function requireRole(...roles: string[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(createAppError("Not authenticated", 401, "UNAUTHORIZED"));
      return;
    }

    if (!roles.includes(req.user.role)) {
      next(createAppError("Insufficient permissions", 403, "FORBIDDEN"));
      return;
    }

    next();
  };
}
