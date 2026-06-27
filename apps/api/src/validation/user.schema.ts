import { z } from "zod";

export const createProfileSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  role: z.enum(["tasker", "buddy"]),
  bio: z.string().max(500).optional(),
  city: z.string().min(2, "City is required").optional(),
  state: z.string().min(2, "State is required").optional(),
  pincode: z.string().regex(/^\d{6}$/, "Pincode must be 6 digits").optional(),
  skills: z.array(z.string()).optional(),
});

export type CreateProfileDto = z.infer<typeof createProfileSchema>;
