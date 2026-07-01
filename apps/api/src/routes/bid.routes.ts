import { Router } from "express";
import { bidController } from "../controllers/bid.controller.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { requireBidOwnership, requireTaskOwnership } from "../middleware/marketplace.js";
import { validate } from "../middleware/validate.js";
import { updateBidSchema } from "../validation/bid.schema.js";

const router = Router();

// Update Bid: PATCH /v1/bids/:bidId
router.patch(
  "/:bidId",
  requireAuth,
  requireBidOwnership,
  validate(updateBidSchema),
  bidController.updateBid
);

// Accept Bid: POST /v1/bids/:bidId/accept
router.post(
  "/:bidId/accept",
  requireAuth,
  requireRole("tasker"),
  requireTaskOwnership,
  bidController.acceptBid
);

export default router;
