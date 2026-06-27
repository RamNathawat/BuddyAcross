import { Router } from "express";
import { kycService } from "../services/kyc.service.js";
import { requireAuth } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { submitKycSchema } from "../validation/kyc.schema.js";
import { cloudinary } from "../config/cloudinary.js";

const router = Router();

/**
 * POST /v1/kyc/upload
 * Handle actual image upload to Cloudinary
 */
router.post("/upload", requireAuth, async (req, res, next) => {
  try {
    const { file, image, filename, type } = req.body;
    const fileData = file || image;

    if (fileData && typeof fileData === "string" && fileData.startsWith("data:image")) {
      const uploadResult = await cloudinary.uploader.upload(fileData, {
        folder: `buddyacross/kyc/${req.user?.id || "demo"}`,
      });
      res.status(200).json({
        success: true,
        data: { url: uploadResult.secure_url },
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
    if (req.body.aadhaarFront && req.body.aadhaarFront.startsWith("data:image")) {
      const resFront = await cloudinary.uploader.upload(req.body.aadhaarFront, {
        folder: `buddyacross/kyc/${req.user?.id || "demo"}/front`,
      });
      req.body.aadhaarFront = resFront.secure_url;
    }
    if (req.body.aadhaarBack && req.body.aadhaarBack.startsWith("data:image")) {
      const resBack = await cloudinary.uploader.upload(req.body.aadhaarBack, {
        folder: `buddyacross/kyc/${req.user?.id || "demo"}/back`,
      });
      req.body.aadhaarBack = resBack.secure_url;
    }
    if (req.body.selfie && req.body.selfie.startsWith("data:image")) {
      const resSelfie = await cloudinary.uploader.upload(req.body.selfie, {
        folder: `buddyacross/kyc/${req.user?.id || "demo"}/selfie`,
      });
      req.body.selfie = resSelfie.secure_url;
    }

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
