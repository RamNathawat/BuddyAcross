import { eq, desc } from "drizzle-orm";
import { db } from "../config/database.js";
import { users, buddyProfiles, kycSubmissions } from "../db/schema.js";
import type { SubmitKycDto, ReviewKycDto } from "../validation/kyc.schema.js";
import { createAppError } from "../middleware/error-handler.js";
import { supabaseAdmin } from "../config/supabase.js";

export class KycService {
  /**
   * Submit KYC documents for a buddy
   */
  async submitKyc(userId: string, dto: SubmitKycDto) {
    let profileResult = await db
      .select()
      .from(buddyProfiles)
      .where(eq(buddyProfiles.userId, userId))
      .limit(1);

    if (profileResult.length === 0) {
      const userRes = await db.select().from(users).where(eq(users.id, userId)).limit(1);
      if (userRes.length === 0) {
        throw createAppError("User not found.", 404, "NOT_FOUND");
      }
      const newProf = await db
        .insert(buddyProfiles)
        .values({
          userId,
          city: "Bengaluru",
          state: "Karnataka",
          pincode: "560001",
          skills: dto.skills || ["Home Cleaning"],
        })
        .returning();
      profileResult = newProf;
    }

    const profile = profileResult[0];

    // Update buddy profile skills if provided
    if (dto.skills && dto.skills.length > 0) {
      await db
        .update(buddyProfiles)
        .set({ skills: dto.skills, updatedAt: new Date() })
        .where(eq(buddyProfiles.id, profile.id));
    }

    // Check existing
    const existingKyc = await db
      .select()
      .from(kycSubmissions)
      .where(eq(kycSubmissions.buddyId, profile.id))
      .limit(1);

    let submission;

    const kycData = {
      aadhaarFront: dto.aadhaarFront,
      aadhaarBack: dto.aadhaarBack,
      selfie: dto.selfie,
      accountHolder: dto.accountHolder || null,
      accountNumber: dto.accountNumber || null,
      ifscCode: dto.ifscCode || null,
      emergencyName: dto.emergencyName || null,
      emergencyPhone: dto.emergencyPhone || null,
      skills: dto.skills || null,
      zones: dto.zones || null,
      status: "pending" as const,
      rejectionReason: null,
      submittedAt: new Date(),
    };

    if (existingKyc.length > 0) {
      const updated = await db
        .update(kycSubmissions)
        .set(kycData)
        .where(eq(kycSubmissions.id, existingKyc[0].id))
        .returning();

      submission = updated[0];
    } else {
      const inserted = await db
        .insert(kycSubmissions)
        .values({
          buddyId: profile.id,
          ...kycData,
        })
        .returning();

      submission = inserted[0];
    }

    // Update buddy profile kyc status
    await db
      .update(buddyProfiles)
      .set({
        kycStatus: "pending",
        updatedAt: new Date(),
      })
      .where(eq(buddyProfiles.id, profile.id));

    return submission;
  }

  /**
   * Admin: List all pending KYC submissions
   */
  async listPendingKycs() {
    // Join kycSubmissions -> buddyProfiles -> users
    const results = await db
      .select({
        submission: kycSubmissions,
        profile: buddyProfiles,
        user: users,
      })
      .from(kycSubmissions)
      .innerJoin(buddyProfiles, eq(kycSubmissions.buddyId, buddyProfiles.id))
      .innerJoin(users, eq(buddyProfiles.userId, users.id))
      .orderBy(desc(kycSubmissions.submittedAt));

    return results;
  }

  /**
   * Admin: Review a KYC submission (Approve / Reject / Request Resubmission)
   */
  async reviewKyc(submissionId: string, adminUserId: string, dto: ReviewKycDto) {
    const kycResult = await db
      .select()
      .from(kycSubmissions)
      .where(eq(kycSubmissions.id, submissionId))
      .limit(1);

    if (kycResult.length === 0) {
      throw createAppError("KYC submission not found", 404, "NOT_FOUND");
    }

    const kyc = kycResult[0];

    // Update kyc submission
    const updatedKyc = await db
      .update(kycSubmissions)
      .set({
        status: dto.status,
        rejectionReason: dto.rejectionReason || null,
        reviewedAt: new Date(),
        reviewedBy: adminUserId,
      })
      .where(eq(kycSubmissions.id, submissionId))
      .returning();

    // Update buddy profile status
    const updatedProfiles = await db
      .update(buddyProfiles)
      .set({
        kycStatus: dto.status,
        updatedAt: new Date(),
      })
      .where(eq(buddyProfiles.id, kyc.buddyId))
      .returning();

    if (updatedProfiles.length > 0 && updatedProfiles[0].userId) {
      try {
        await supabaseAdmin.auth.admin.updateUserById(updatedProfiles[0].userId, {
          app_metadata: { kyc_status: dto.status },
        });
      } catch (err) {
        console.warn("Could not sync kyc_status to Supabase Auth metadata:", err);
      }
    }

    return updatedKyc[0];
  }
}

export const kycService = new KycService();
