import { Router } from "express";
import { kycService } from "../services/kyc.service.js";
import { requireAuth } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { submitKycSchema } from "../validation/kyc.schema.js";

const router = Router();

/**
 * POST /v1/kyc/upload
 * Return mock Cloudinary URL or handle file upload
 */
router.post("/upload", requireAuth, async (req, res, next) => {
  try {
    // For MVP frontend upload simulation or base64
    const { filename, type } = req.body;
    const mockUrl = `https://res.cloudinary.com/dummy/image/upload/v12345678/kyc/${req.user!.id}/${filename || "doc"}.jpg`;
    
    res.status(200).json({
      success: true,
      data: { url: mockUrl },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /v1/kyc/submit
 * Submit Aadhaar front, back, and selfie URLs
 */
router.post("/submit", requireAuth, validate(submitKycSchema), async (req, res, next) => {
  try {
    const data = await kycService.submitKyc(req.user!.id, req.body);
    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
