import { eq, and, inArray } from "drizzle-orm";
import { db } from "../config/database.js";
import { tasks, bids } from "../db/schema.js";
import type { CreateBidDto, UpdateBidDto } from "../validation/bid.schema.js";
import { createAppError } from "../middleware/error-handler.js";
import { supabaseAdmin } from "../config/supabase.js";

export class BidService {
  async createBid(taskId: string, buddyId: string, dto: CreateBidDto) {
    const [task] = await db
      .select()
      .from(tasks)
      .where(eq(tasks.id, taskId))
      .limit(1);

    if (!task) {
      throw createAppError("Task not found", 404, "TASK_NOT_FOUND");
    }

    if (task.status !== "open") {
      throw createAppError("Task is no longer open for bids", 400, "TASK_NOT_OPEN");
    }

    const [existingBid] = await db
      .select()
      .from(bids)
      .where(
        and(
          eq(bids.taskId, taskId),
          eq(bids.buddyId, buddyId),
          inArray(bids.status, ["pending", "accepted"])
        )
      )
      .limit(1);

    if (existingBid) {
      throw createAppError(
        "You already have an active bid on this chore. Use counter-bid to update.",
        409,
        "DUPLICATE_BID"
      );
    }

    const [newBid] = await db
      .insert(bids)
      .values({
        taskId,
        buddyId,
        amount: dto.amount,
        message: dto.message || null,
        status: "pending",
      })
      .returning();

    return newBid;
  }

  async updateBid(bidId: string, dto: UpdateBidDto) {
    const [bid] = await db
      .select()
      .from(bids)
      .where(eq(bids.id, bidId))
      .limit(1);

    if (!bid) {
      throw createAppError("Bid not found", 404, "BID_NOT_FOUND");
    }

    if (bid.status !== "pending") {
      throw createAppError("Cannot update a bid that is no longer pending", 400, "BID_NOT_PENDING");
    }

    const [task] = await db
      .select()
      .from(tasks)
      .where(eq(tasks.id, bid.taskId))
      .limit(1);

    if (!task || task.status !== "open") {
      throw createAppError("Associated task is no longer open", 400, "TASK_NOT_OPEN");
    }

    const updateFields: Record<string, any> = { updatedAt: new Date() };
    if (dto.amount !== undefined) updateFields.amount = dto.amount;
    if (dto.message !== undefined) updateFields.message = dto.message;

    const [updatedBid] = await db
      .update(bids)
      .set(updateFields)
      .where(eq(bids.id, bidId))
      .returning();

    return updatedBid;
  }

  async acceptBid(bidId: string, taskerId: string) {
    const [bid] = await db
      .select()
      .from(bids)
      .where(eq(bids.id, bidId))
      .limit(1);

    if (!bid) {
      throw createAppError("Bid not found", 404, "BID_NOT_FOUND");
    }

    // Call stored procedure fn_accept_bid atomically
    const { data, error } = await supabaseAdmin.rpc("fn_accept_bid", {
      p_task_id: bid.taskId,
      p_bid_id: bid.id,
      p_tasker_id: taskerId,
    });

    if (error) {
      const msg = error.message || "Failed to accept bid";
      if (msg.includes("Task not found or unauthorized")) {
        throw createAppError("You do not own this task", 403, "FORBIDDEN");
      }
      if (msg.includes("Task is not open for bids")) {
        throw createAppError("Task is no longer open for bids", 400, "TASK_NOT_OPEN");
      }
      if (msg.includes("Bid not found or not in pending status")) {
        throw createAppError("Bid is not pending", 400, "BID_NOT_PENDING");
      }
      throw createAppError(msg, 400, "ACCEPT_BID_FAILED");
    }

    return {
      success: true,
      taskId: bid.taskId,
      bidId: bid.id,
      result: data,
    };
  }
}
