import { z } from "zod";

export const submitKycSchema = z.object({
  aadhaarFront: z.string().url("Valid Aadhaar front URL is required"),
  aadhaarBack: z.string().url("Valid Aadhaar back URL is required"),
  selfie: z.string().url("Valid selfie URL is required"),
});

export type SubmitKycDto = z.infer<typeof submitKycSchema>;

export const reviewKycSchema = z.object({
  status: z.enum(["approved", "rejected", "resubmission_requested"]),
  rejectionReason: z.string().max(500).optional(),
}).refine((data) => {
  if (data.status === "rejected" || data.status === "resubmission_requested") {
    return !!data.rejectionReason && data.rejectionReason.trim().length > 0;
  }
  return true;
}, {
  message: "Reason is required when rejecting or requesting resubmission",
  path: ["rejectionReason"],
});

export type ReviewKycDto = z.infer<typeof reviewKycSchema>;
