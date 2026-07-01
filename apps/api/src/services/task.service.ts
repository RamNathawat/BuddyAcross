import { eq, and, sql, desc, asc, inArray } from "drizzle-orm";
import { db } from "../config/database.js";
import { tasks, users, bids } from "../db/schema.js";
import type { CreateTaskDto, UpdateTaskDto, GetTasksQueryDto } from "../validation/task.schema.js";
import { createAppError } from "../middleware/error-handler.js";

export class TaskService {
  async createTask(taskerId: string, dto: CreateTaskDto) {
    const [task] = await db
      .insert(tasks)
      .values({
        taskerId,
        title: dto.title,
        description: dto.description,
        category: dto.category,
        zone: dto.zone,
        budgetMin: dto.budgetMin,
        budgetMax: dto.budgetMax,
        status: "open",
      })
      .returning();

    return task;
  }

  async getTasks(query: GetTasksQueryDto) {
    const { page, limit, zone, category, status, taskerId, bidderId, sortBy, sortOrder } = query;
    const offset = (page - 1) * limit;

    const conditions: any[] = [];
    if (status) {
      conditions.push(eq(tasks.status, status as any));
    } else if (!taskerId && !bidderId) {
      // Strictly return open tasks by default for public marketplace feed
      conditions.push(eq(tasks.status, "open"));
    }
    if (taskerId) {
      conditions.push(eq(tasks.taskerId, taskerId));
    }
    if (bidderId) {
      conditions.push(
        sql`EXISTS (SELECT 1 FROM ${bids} WHERE ${bids.taskId} = ${tasks.id} AND ${bids.buddyId} = ${bidderId})`
      );
    }
    if (zone) {
      conditions.push(eq(tasks.zone, zone));
    }
    if (category) {
      conditions.push(eq(tasks.category, category));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Get total count
    const [countResult] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(tasks)
      .where(whereClause);
    const total = countResult?.count || 0;

    // Sorting order
    const orderCol = sortBy === "budgetMax" ? tasks.budgetMax : tasks.createdAt;
    const orderByClause = sortOrder === "asc" ? asc(orderCol) : desc(orderCol);

    // Select tasks with joined tasker info and subquery for bidCount
    const rows = await db
      .select({
        id: tasks.id,
        taskerId: tasks.taskerId,
        title: tasks.title,
        description: tasks.description,
        category: tasks.category,
        zone: tasks.zone,
        budgetMin: tasks.budgetMin,
        budgetMax: tasks.budgetMax,
        status: tasks.status,
        acceptedBidId: tasks.acceptedBidId,
        createdAt: tasks.createdAt,
        updatedAt: tasks.updatedAt,
        taskerName: users.fullName,
        taskerAvatar: users.avatarUrl,
        bidCount: sql<number>`(SELECT count(*)::int FROM ${bids} WHERE ${bids.taskId} = ${tasks.id})`,
      })
      .from(tasks)
      .leftJoin(users, eq(tasks.taskerId, users.id))
      .where(whereClause)
      .orderBy(orderByClause)
      .limit(limit)
      .offset(offset);

    const userBidsMap = new Map<string, any>();
    if (bidderId && rows.length > 0) {
      const taskIds = rows.map((r) => r.id);
      const userBids = await db
        .select()
        .from(bids)
        .where(and(inArray(bids.taskId, taskIds), eq(bids.buddyId, bidderId)));
      for (const b of userBids) {
        userBidsMap.set(b.taskId, b);
      }
    }

    const formattedTasks = rows.map((r) => ({
      id: r.id,
      taskerId: r.taskerId,
      title: r.title,
      description: r.description,
      category: r.category,
      zone: r.zone,
      budgetMin: r.budgetMin,
      budgetMax: r.budgetMax,
      status: r.status,
      acceptedBidId: r.acceptedBidId,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
      bidCount: r.bidCount || 0,
      myBid: userBidsMap.get(r.id) || null,
      tasker: {
        fullName: r.taskerName || "Verified Resident",
        avatarUrl: r.taskerAvatar || null,
      },
    }));

    return {
      tasks: formattedTasks,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  async getTaskById(taskId: string, currentUserId?: string, currentUserRole?: string) {
    const [row] = await db
      .select({
        id: tasks.id,
        taskerId: tasks.taskerId,
        title: tasks.title,
        description: tasks.description,
        category: tasks.category,
        zone: tasks.zone,
        budgetMin: tasks.budgetMin,
        budgetMax: tasks.budgetMax,
        status: tasks.status,
        acceptedBidId: tasks.acceptedBidId,
        createdAt: tasks.createdAt,
        updatedAt: tasks.updatedAt,
        taskerName: users.fullName,
        taskerAvatar: users.avatarUrl,
        taskerPhone: users.phone,
        taskerEmail: users.email,
        bidCount: sql<number>`(SELECT count(*)::int FROM ${bids} WHERE ${bids.taskId} = ${tasks.id})`,
      })
      .from(tasks)
      .leftJoin(users, eq(tasks.taskerId, users.id))
      .where(eq(tasks.id, taskId))
      .limit(1);

    if (!row) {
      throw createAppError("Task not found", 404, "TASK_NOT_FOUND");
    }

    const isTaskOwner = currentUserId === row.taskerId;
    const isBuddy = currentUserRole === "buddy";

    let taskBids: any[] = [];
    let myBid: any = null;

    if (isTaskOwner) {
      // Tasker sees all bids placed on their task
      const bidRows = await db
        .select({
          id: bids.id,
          taskId: bids.taskId,
          buddyId: bids.buddyId,
          amount: bids.amount,
          message: bids.message,
          status: bids.status,
          createdAt: bids.createdAt,
          updatedAt: bids.updatedAt,
          buddyName: users.fullName,
          buddyAvatar: users.avatarUrl,
          buddyPhone: users.phone,
          buddyEmail: users.email,
        })
        .from(bids)
        .leftJoin(users, eq(bids.buddyId, users.id))
        .where(eq(bids.taskId, taskId))
        .orderBy(desc(bids.createdAt));

      taskBids = bidRows.map((b) => ({
        id: b.id,
        taskId: b.taskId,
        buddyId: b.buddyId,
        amount: b.amount,
        message: b.message,
        status: b.status,
        createdAt: b.createdAt,
        updatedAt: b.updatedAt,
        buddy: {
          fullName: b.buddyName || "Verified Buddy",
          avatarUrl: b.buddyAvatar || null,
          phone: b.status === "accepted" ? (b.buddyPhone || "+91 73397 36528") : undefined,
          email: b.status === "accepted" ? (b.buddyEmail || "buddy@buddyacross.in") : undefined,
        },
      }));
    } else if (currentUserId) {
      // User sees their own bid on this task
      const [userBid] = await db
        .select()
        .from(bids)
        .where(and(eq(bids.taskId, taskId), eq(bids.buddyId, currentUserId)))
        .limit(1);

      if (userBid) {
        myBid = userBid;
      }
    }

    const canSeeTaskerContact = isTaskOwner || myBid?.status === "accepted" || (row.acceptedBidId && myBid?.id === row.acceptedBidId);

    return {
      id: row.id,
      taskerId: row.taskerId,
      title: row.title,
      description: row.description,
      category: row.category,
      zone: row.zone,
      budgetMin: row.budgetMin,
      budgetMax: row.budgetMax,
      status: row.status,
      acceptedBidId: row.acceptedBidId,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      bidCount: row.bidCount || 0,
      tasker: {
        fullName: row.taskerName || "Verified Resident",
        avatarUrl: row.taskerAvatar || null,
        phone: row.status !== "open" && row.status !== "cancelled" && canSeeTaskerContact ? (row.taskerPhone || "+91 98765 43210") : undefined,
        email: row.status !== "open" && row.status !== "cancelled" && canSeeTaskerContact ? (row.taskerEmail || "tasker@buddyacross.in") : undefined,
      },
      bids: taskBids,
      myBid,
    };
  }

  async updateTask(taskId: string, dto: UpdateTaskDto) {
    const [task] = await db
      .select()
      .from(tasks)
      .where(eq(tasks.id, taskId))
      .limit(1);

    if (!task) {
      throw createAppError("Task not found", 404, "TASK_NOT_FOUND");
    }

    if (task.status !== "open") {
      throw createAppError("Cannot edit or cancel a task that is no longer open", 400, "TASK_NOT_OPEN");
    }

    const updateFields: Record<string, any> = { updatedAt: new Date() };
    if (dto.title !== undefined) updateFields.title = dto.title;
    if (dto.description !== undefined) updateFields.description = dto.description;
    if (dto.category !== undefined) updateFields.category = dto.category;
    if (dto.zone !== undefined) updateFields.zone = dto.zone;
    if (dto.budgetMin !== undefined) updateFields.budgetMin = dto.budgetMin;
    if (dto.budgetMax !== undefined) updateFields.budgetMax = dto.budgetMax;
    if (dto.status !== undefined) updateFields.status = dto.status;

    const [updatedTask] = await db
      .update(tasks)
      .set(updateFields)
      .where(eq(tasks.id, taskId))
      .returning();

    if (dto.status === "cancelled") {
      await db
        .update(bids)
        .set({ status: "rejected", updatedAt: new Date() })
        .where(and(eq(bids.taskId, taskId), eq(bids.status, "pending")));
    }

    return updatedTask;
  }
}
