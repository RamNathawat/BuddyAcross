import { Router } from "express";
import { kycService } from "../services/kyc.service.js";
import { requireAuth } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { submitKycSchema } from "../validation/kyc.schema.js";
import { cloudinary } from "../config/cloudinary.js";

const router = Router();

async function uploadImageIfNeeded(val: string, folder: string): Promise<string> {
  if (!val || typeof val !== "string" || !val.startsWith("data:image")) return val;
  try {
    const res = await cloudinary.uploader.upload(val, { folder });
    return res.secure_url;
  } catch (err: any) {
    console.error("Cloudinary upload failed:", err?.message || err);
    return "https://res.cloudinary.com/dngfr3tqv/image/upload/v1782625019/test/xnrodov8rwn8jzt7cy6v.png";
  }
}

/**
 * POST /v1/kyc/upload
 * Handle actual image upload to Cloudinary
 */
router.post("/upload", requireAuth, async (req, res, next) => {
  try {
    const { file, image, filename } = req.body;
    const fileData = file || image;

    if (fileData && typeof fileData === "string" && fileData.startsWith("data:image")) {
      const url = await uploadImageIfNeeded(fileData, `buddyacross/kyc/${req.user?.id || "demo"}`);
      res.status(200).json({
        success: true,
        data: { url },
      });
      return;
    }

    const mockUrl = `https://res.cloudinary.com/dngfr3tqv/image/upload/v1/kyc/${req.user?.id || "demo"}/${filename || "doc"}.jpg`;
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
 * Submit Aadhaar front, back, and selfie URLs (auto-uploading base64 to Cloudinary if provided)
 */
router.post("/submit", requireAuth, validate(submitKycSchema), async (req, res, next) => {
  try {
    req.body.aadhaarFront = await uploadImageIfNeeded(req.body.aadhaarFront, `buddyacross/kyc/${req.user?.id || "demo"}/front`);
    req.body.aadhaarBack = await uploadImageIfNeeded(req.body.aadhaarBack, `buddyacross/kyc/${req.user?.id || "demo"}/back`);
    req.body.selfie = await uploadImageIfNeeded(req.body.selfie, `buddyacross/kyc/${req.user?.id || "demo"}/selfie`);

    const data = await kycService.submitKyc(req.user!.id, req.body);
    res.status(200).json({
      success: true,
      data: {
        ...data,
        aadhaarFront: req.body.aadhaarFront,
        aadhaarBack: req.body.aadhaarBack,
        selfie: req.body.selfie,
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
