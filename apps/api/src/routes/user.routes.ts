import { Router } from "express";
import { userService } from "../services/user.service.js";
import { requireAuth } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { createProfileSchema } from "../validation/user.schema.js";

const router = Router();

/**
 * GET /v1/users/me
 * Get current authenticated user details + profile + KYC
 */
router.get("/me", requireAuth, async (req, res, next) => {
  try {
    const data = await userService.getCurrentUser(req.user!.id);
    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /v1/users/profile
 * Create or update tasker/buddy profile
 */
router.post("/profile", requireAuth, validate(createProfileSchema), async (req, res, next) => {
  try {
    const data = await userService.upsertProfile(req.user!.id, req.body);
    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
