import { z } from "zod";

export const createBidSchema = z.object({
  amount: z.number().int().min(300, "Bid amount must be at least ₹300"),
  message: z.string().max(500, "Message must be at most 500 characters").nullable().optional(),
});

export type CreateBidDto = z.infer<typeof createBidSchema>;

export const updateBidSchema = z.object({
  amount: z.number().int().min(300, "Bid amount must be at least ₹300").optional(),
  message: z.string().max(500, "Message must be at most 500 characters").nullable().optional(),
});

export type UpdateBidDto = z.infer<typeof updateBidSchema>;
