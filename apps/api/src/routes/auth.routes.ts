import { Router } from "express";
import { userService } from "../services/user.service.js";
import { validate } from "../middleware/validate.js";
import { syncUserSchema } from "../validation/auth.schema.js";

const router = Router();

/**
 * POST /v1/auth/sync
 * Sync Supabase auth user into Postgres database
 */
router.post("/sync", validate(syncUserSchema), async (req, res, next) => {
  try {
    const user = await userService.syncUser(req.body);
    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
