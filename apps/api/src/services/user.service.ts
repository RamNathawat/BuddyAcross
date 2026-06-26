import { eq } from "drizzle-orm";
import { db } from "../config/database.js";
import { users, buddyProfiles, kycSubmissions } from "../db/schema.js";
import type { SyncUserDto } from "../validation/auth.schema.js";
import type { CreateProfileDto } from "../validation/user.schema.js";
import { createAppError } from "../middleware/error-handler.js";

export class UserService {
  /**
   * Sync Supabase auth user into Postgres users table
   */
  async syncUser(dto: SyncUserDto) {
    const existing = await db
      .select()
      .from(users)
      .where(eq(users.id, dto.id))
      .limit(1);

    if (existing.length > 0) {
      return existing[0];
    }

    const inserted = await db
      .insert(users)
      .values({
        id: dto.id,
        email: dto.email || null,
        phone: dto.phone || null,
        fullName: dto.fullName || dto.email?.split("@")[0] || "New User",
      })
      .returning();

    return inserted[0];
  }

  /**
   * Get current user with buddy profile and KYC info
   */
  async getCurrentUser(userId: string) {
    const userResult = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (userResult.length === 0) {
      throw createAppError("User not found", 404, "NOT_FOUND");
    }

    const user = userResult[0];

    let profile = null;
    let kyc = null;

    if (user.role === "buddy") {
      const profileResult = await db
        .select()
        .from(buddyProfiles)
        .where(eq(buddyProfiles.userId, userId))
        .limit(1);

      if (profileResult.length > 0) {
        profile = profileResult[0];

        const kycResult = await db
          .select()
          .from(kycSubmissions)
          .where(eq(kycSubmissions.buddyId, profile.id))
          .limit(1);

        if (kycResult.length > 0) {
          kyc = kycResult[0];
        }
      }
    }

    return { user, profile, kyc };
  }

  /**
   * Create or update user profile
   */
  async upsertProfile(userId: string, dto: CreateProfileDto) {
    // 1. Update users table with fullName and role
    const updatedUsers = await db
      .update(users)
      .set({
        fullName: dto.fullName,
        role: dto.role,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();

    if (updatedUsers.length === 0) {
      throw createAppError("User not found", 404, "NOT_FOUND");
    }

    const user = updatedUsers[0];

    // 2. If role is buddy, create/update buddy profile
    if (dto.role === "buddy") {
      const existingProfile = await db
        .select()
        .from(buddyProfiles)
        .where(eq(buddyProfiles.userId, userId))
        .limit(1);

      if (existingProfile.length > 0) {
        const updated = await db
          .update(buddyProfiles)
          .set({
            bio: dto.bio || null,
            city: dto.city!,
            state: dto.state!,
            pincode: dto.pincode!,
            skills: dto.skills!,
            updatedAt: new Date(),
          })
          .where(eq(buddyProfiles.userId, userId))
          .returning();

        return { user, profile: updated[0] };
      } else {
        const created = await db
          .insert(buddyProfiles)
          .values({
            userId,
            bio: dto.bio || null,
            city: dto.city!,
            state: dto.state!,
            pincode: dto.pincode!,
            skills: dto.skills!,
            kycStatus: "pending",
          })
          .returning();

        return { user, profile: created[0] };
      }
    }

    return { user, profile: null };
  }
}

export const userService = new UserService();
