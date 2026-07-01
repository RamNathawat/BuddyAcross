import type { Request, Response, NextFunction } from "express";
import { TaskService } from "../services/task.service.js";

const taskService = new TaskService();

export class TaskController {
  async createTask(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const task = await taskService.createTask(req.user!.id, req.body);
      res.status(201).json({
        success: true,
        data: task,
      });
    } catch (error) {
      next(error);
    }
  }

  async getTasks(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await taskService.getTasks((req as any).validatedQuery || req.query);
      res.status(200).json({
        success: true,
        data: result.tasks,
        meta: result.meta,
      });
    } catch (error) {
      next(error);
    }
  }

  async getTaskById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const rawId = req.params.id;
      const taskId = Array.isArray(rawId) ? rawId[0] : rawId;
      const task = await taskService.getTaskById(
        taskId,
        req.user?.id,
        req.user?.role
      );
      res.status(200).json({
        success: true,
        data: task,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateTask(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const rawId = req.params.id;
      const taskId = Array.isArray(rawId) ? rawId[0] : rawId;
      const task = await taskService.updateTask(taskId, req.body);
      res.status(200).json({
        success: true,
        data: task,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const taskController = new TaskController();
