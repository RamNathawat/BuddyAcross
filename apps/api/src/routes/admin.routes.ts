import { Router } from "express";
import { kycService } from "../services/kyc.service.js";
import { requireRole } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { reviewKycSchema } from "../validation/kyc.schema.js";

const router = Router();

/**
 * GET /v1/admin/kyc
 * List all pending KYC submissions
 */
router.get("/kyc", requireRole("admin"), async (req, res, next) => {
  try {
    const data = await kycService.listPendingKycs();
    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /v1/admin/kyc/:id/review
 * Approve, Reject, or Request Resubmission for a KYC record
 */
router.post("/kyc/:id/review", requireRole("admin"), validate(reviewKycSchema), async (req, res, next) => {
  try {
    const submissionId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const data = await kycService.reviewKyc(submissionId, req.user!.id, req.body);
    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
