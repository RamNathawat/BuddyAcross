import { Router } from "express";
import { taskController } from "../controllers/task.controller.js";
import { bidController } from "../controllers/bid.controller.js";
import { requireAuth, requireRole, optionalAuth } from "../middleware/auth.js";
import { requireApprovedBuddy, requireTaskOwnership } from "../middleware/marketplace.js";
import { validate, validateQuery } from "../middleware/validate.js";
import { createTaskSchema, updateTaskSchema, getTasksQuerySchema } from "../validation/task.schema.js";
import { createBidSchema } from "../validation/bid.schema.js";

const router = Router();

// Feed: GET /v1/tasks
router.get("/", validateQuery(getTasksQuerySchema), taskController.getTasks);

// Create Task: POST /v1/tasks
router.post(
  "/",
  requireAuth,
  requireRole("tasker"),
  validate(createTaskSchema),
  taskController.createTask
);

// Get Task Details: GET /v1/tasks/:id
router.get("/:id", optionalAuth, taskController.getTaskById);

// Update/Cancel Task: PATCH /v1/tasks/:id
router.patch(
  "/:id",
  requireAuth,
  requireRole("tasker"),
  requireTaskOwnership,
  validate(updateTaskSchema),
  taskController.updateTask
);

// Create Bid on Task: POST /v1/tasks/:taskId/bids
router.post(
  "/:taskId/bids",
  requireAuth,
  requireApprovedBuddy,
  validate(createBidSchema),
  bidController.createBid
);

export default router;
