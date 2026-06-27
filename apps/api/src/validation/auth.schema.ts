import { z } from "zod";

export const syncUserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  fullName: z.string().optional().nullable(),
  role: z.enum(["buddy", "tasker", "admin"]).optional().nullable(),
});

export type SyncUserDto = z.infer<typeof syncUserSchema>;
