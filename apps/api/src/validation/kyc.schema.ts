import { z } from "zod";

export const submitKycSchema = z.object({
  aadhaarFront: z.string().min(1, "Aadhaar front is required"),
  aadhaarBack: z.string().min(1, "Aadhaar back is required"),
  selfie: z.string().min(1, "Selfie is required"),
  accountHolder: z.string().optional(),
  accountNumber: z.string().optional(),
  ifscCode: z.string().optional(),
  emergencyName: z.string().optional(),
  emergencyPhone: z.string().optional(),
  skills: z.array(z.string()).optional(),
  zones: z.array(z.string()).optional(),
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
