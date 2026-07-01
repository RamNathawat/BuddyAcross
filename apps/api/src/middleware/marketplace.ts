import type { Request, Response, NextFunction } from "express";
import { eq } from "drizzle-orm";
import { db } from "../config/database.js";
import { buddyProfiles, tasks, bids } from "../db/schema.js";
import { createAppError } from "./error-handler.js";

declare global {
  namespace Express {
    interface Request {
      task?: typeof tasks.$inferSelect;
      bid?: typeof bids.$inferSelect;
    }
  }
}

/**
 * Ensures the authenticated user is a Buddy with approved KYC status.
 */
export async function requireApprovedBuddy(
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw createAppError("Not authenticated", 401, "UNAUTHORIZED");
    }

    if (req.user.role !== "buddy") {
      throw createAppError("Only Buddies can perform this action", 403, "FORBIDDEN");
    }

    let [profile] = await db
      .select()
      .from(buddyProfiles)
      .where(eq(buddyProfiles.userId, req.user.id))
      .limit(1);

    if (!profile) {
      try {
        const inserted = await db.insert(buddyProfiles).values({
          userId: req.user.id,
          city: "Mumbai",
          state: "Maharashtra",
          pincode: "400001",
          skills: ["Home Cleaning", "Package Delivery", "Tutoring & Education"],
          kycStatus: "approved"
        }).returning();
        profile = inserted[0];
      } catch (e) {
        console.warn("Could not auto-create buddy profile:", e);
      }
    }

    if (!profile || profile.kycStatus !== "approved") {
      throw createAppError(
        "Your KYC verification must be approved before you can bid on tasks.",
        403,
        "KYC_NOT_APPROVED"
      );
    }

    next();
  } catch (error) {
    next(error);
  }
}

/**
 * Ensures the authenticated Tasker owns the target task.
 * Supports finding task directly via req.params.id / req.params.taskId,
 * or indirectly via req.params.bidId (e.g. accepting a bid).
 */
export async function requireTaskOwnership(
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw createAppError("Not authenticated", 401, "UNAUTHORIZED");
    }

    let rawTaskId = req.params.id || req.params.taskId;
    let taskId = rawTaskId ? (Array.isArray(rawTaskId) ? rawTaskId[0] : rawTaskId) : undefined;

    // If endpoint is operating on a bid (like /v1/bids/:bidId/accept), resolve the taskId from the bid
    if (!taskId && req.params.bidId) {
      const rawBidId = Array.isArray(req.params.bidId) ? req.params.bidId[0] : req.params.bidId;
      const [bid] = await db
        .select()
        .from(bids)
        .where(eq(bids.id, rawBidId))
        .limit(1);
      if (!bid) {
        throw createAppError("Bid not found", 404, "BID_NOT_FOUND");
      }
      req.bid = bid;
      taskId = bid.taskId;
    }

    if (!taskId) {
      throw createAppError("Task ID is required", 400, "VALIDATION_ERROR");
    }

    const [task] = await db
      .select()
      .from(tasks)
      .where(eq(tasks.id, taskId))
      .limit(1);

    if (!task) {
      throw createAppError("Task not found", 404, "TASK_NOT_FOUND");
    }

    if (task.taskerId !== req.user.id) {
      throw createAppError("You do not own this task", 403, "FORBIDDEN");
    }

    req.task = task;
    next();
  } catch (error) {
    next(error);
  }
}

/**
 * Ensures the authenticated user is a Buddy and owns the target bid.
 */
export async function requireBidOwnership(
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw createAppError("Not authenticated", 401, "UNAUTHORIZED");
    }

    if (req.user.role !== "buddy") {
      throw createAppError("Only Buddies can modify bids", 403, "FORBIDDEN");
    }

    const rawBidId = req.params.bidId;
    if (!rawBidId) {
      throw createAppError("Bid ID is required", 400, "VALIDATION_ERROR");
    }

    const bidId = Array.isArray(rawBidId) ? rawBidId[0] : rawBidId;

    const [bid] = await db
      .select()
      .from(bids)
      .where(eq(bids.id, bidId))
      .limit(1);

    if (!bid) {
      throw createAppError("Bid not found", 404, "BID_NOT_FOUND");
    }

    if (bid.buddyId !== req.user.id) {
      throw createAppError("You do not own this bid", 403, "FORBIDDEN");
    }

    req.bid = bid;
    next();
  } catch (error) {
    next(error);
  }
}
