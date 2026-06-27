import { Router } from "express";
import { userService } from "../services/user.service.js";
import { validate } from "../middleware/validate.js";
import { syncUserSchema } from "../validation/auth.schema.js";

const router = Router();

// In-memory OTP storage for Smart Hybrid / Fallback testing
const otpCache = new Map<string, { code: string; expiresAt: number }>();

/**
 * POST /v1/auth/send-otp
 * Smart Hybrid OTP Sender: Fast2SMS if key present, else Logs code to Console
 */
router.post("/send-otp", async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone) {
      return res.status(400).json({ success: false, message: "Phone number required" });
    }

    // Generate random 6-digit passcode
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    otpCache.set(phone, { code, expiresAt: Date.now() + 10 * 60 * 1000 });

    console.log(`\n======================================================`);
    console.log(`🔑 [BuddyAcross Smart OTP] Passcode for ${phone} is: ${code}`);
    console.log(`💡 (Universal testing master code '123456' is also active)`);
    console.log(`======================================================\n`);

    const fast2smsKey = process.env.FAST2SMS_API_KEY;
    if (fast2smsKey && fast2smsKey.length > 5) {
      // Clean phone (remove +91 or non-digits)
      const cleanNum = phone.replace(/\D/g, "").slice(-10);
      try {
        await fetch(`https://www.fast2sms.com/dev/bulkV2?authorization=${fast2smsKey}&variables_values=${code}&route=otp&numbers=${cleanNum}`);
      } catch (e) {
        console.error("Fast2SMS delivery error (using console fallback):", e);
      }
    }

    res.status(200).json({
      success: true,
      message: "OTP dispatched successfully",
      devCode: code,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err?.message || "Failed to send OTP" });
  }
});

/**
 * POST /v1/auth/verify-otp
 * Verify Smart Hybrid OTP or Universal 123456 code
 */
router.post("/verify-otp", async (req, res) => {
  try {
    const { phone, otp } = req.body;
    if (!phone || !otp) {
      return res.status(400).json({ success: false, message: "Phone and OTP required" });
    }

    // Universal demo master code or matching cache
    const cached = otpCache.get(phone);
    const isMaster = otp === "123456";
    const isValid = isMaster || (cached && cached.code === otp && cached.expiresAt > Date.now());

    if (!isValid) {
      return res.status(400).json({ success: false, message: "Invalid or expired OTP code" });
    }

    if (!isMaster && cached) {
      otpCache.delete(phone);
    }

    res.status(200).json({
      success: true,
      message: "OTP verified successfully",
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err?.message || "Failed to verify OTP" });
  }
});

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
