import { z } from "zod";

export const syncUserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  fullName: z.string().min(2, "Full name must be at least 2 characters").optional(),
});

export type SyncUserDto = z.infer<typeof syncUserSchema>;
