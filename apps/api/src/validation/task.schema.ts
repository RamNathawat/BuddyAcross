import { z } from "zod";
import { TASK_CATEGORIES } from "@buddyacross/shared";

const validCategories = TASK_CATEGORIES.map((c) => c.value);

export const createTaskSchema = z
  .object({
    title: z
      .string()
      .min(5, "Title must be at least 5 characters")
      .max(100, "Title must be at most 100 characters"),
    description: z
      .string()
      .min(10, "Description must be at least 10 characters")
      .max(2000, "Description must be at most 2000 characters"),
    category: z
      .string()
      .refine((val) => validCategories.includes(val as any), {
        message: "Invalid task category",
      }),
    zone: z
      .string()
      .min(2, "Zone is required")
      .max(100, "Zone must be at most 100 characters"),
    budgetMin: z.number().int().min(300, "Minimum budget is ₹300"),
    budgetMax: z.number().int().min(300, "Minimum budget is ₹300"),
  })
  .refine((data) => data.budgetMax >= data.budgetMin, {
    message: "Maximum budget must be greater than or equal to minimum budget",
    path: ["budgetMax"],
  });

export type CreateTaskDto = z.infer<typeof createTaskSchema>;

export const updateTaskSchema = z
  .object({
    title: z.string().min(5).max(100).optional(),
    description: z.string().min(10).max(2000).optional(),
    category: z
      .string()
      .refine((val) => validCategories.includes(val as any), {
        message: "Invalid task category",
      })
      .optional(),
    zone: z.string().min(2).max(100).optional(),
    budgetMin: z.number().int().min(300).optional(),
    budgetMax: z.number().int().min(300).optional(),
    status: z.literal("cancelled").optional(),
  })
  .refine(
    (data) => {
      if (
        data.budgetMin !== undefined &&
        data.budgetMax !== undefined &&
        data.budgetMax < data.budgetMin
      ) {
        return false;
      }
      return true;
    },
    {
      message: "Maximum budget must be greater than or equal to minimum budget",
      path: ["budgetMax"],
    }
  );

export type UpdateTaskDto = z.infer<typeof updateTaskSchema>;

export const getTasksQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
  zone: z.string().optional(),
  category: z.string().optional(),
  status: z.enum(["open", "accepted", "completed", "cancelled"]).optional(),
  taskerId: z.string().optional(),
  bidderId: z.string().optional(),
  sortBy: z.enum(["createdAt", "budgetMax"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export type GetTasksQueryDto = z.infer<typeof getTasksQuerySchema>;
