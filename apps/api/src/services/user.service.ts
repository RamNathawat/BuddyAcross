import { eq } from "drizzle-orm";
import { db } from "../config/database.js";
import { users, buddyProfiles, kycSubmissions, taskers } from "../db/schema.js";
import type { SyncUserDto } from "../validation/auth.schema.js";
import type { CreateProfileDto } from "../validation/user.schema.js";
import { createAppError } from "../middleware/error-handler.js";
import { supabaseAdmin } from "../config/supabase.js";

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

    const actualEmail = dto.email && dto.email.includes("@") ? dto.email : null;
    const actualPhone = dto.phone || (dto.email && !dto.email.includes("@") ? dto.email : null);
    const actualName = dto.fullName || (actualEmail ? actualEmail.split("@")[0] : actualPhone || "New User");

    if (existing.length > 0) {
      const u = existing[0];
      if ((dto.role && !u.role) || (actualPhone && !u.phone) || (actualName !== "New User" && u.fullName === "New User")) {
        const updated = await db
          .update(users)
          .set({
            role: dto.role || u.role,
            phone: actualPhone || u.phone,
            fullName: actualName !== "New User" ? actualName : u.fullName,
          })
          .where(eq(users.id, dto.id))
          .returning();
        if (dto.role) {
          try {
            await supabaseAdmin.auth.admin.updateUserById(dto.id, {
              app_metadata: { role: dto.role },
            });
          } catch (e) {
            console.warn("Could not sync role in syncUser:", e);
          }
        }
        return updated[0];
      }
      return u;
    }

    if (dto.role) {
      try {
        await supabaseAdmin.auth.admin.updateUserById(dto.id, {
          app_metadata: { role: dto.role },
        });
      } catch (e) {
        console.warn("Could not sync role in syncUser:", e);
      }
    }

    const inserted = await db
      .insert(users)
      .values({
        id: dto.id,
        email: actualEmail,
        phone: actualPhone,
        fullName: actualName,
        role: dto.role || null,
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
    } else if (user.role === "tasker") {
      const profileResult = await db
        .select()
        .from(taskers)
        .where(eq(taskers.userId, userId))
        .limit(1);

      if (profileResult.length > 0) {
        profile = profileResult[0];
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

    // Sync role to Supabase Auth app_metadata
    try {
      await supabaseAdmin.auth.admin.updateUserById(userId, {
        app_metadata: { role: dto.role },
      });
    } catch (err) {
      console.warn("Could not sync role to Supabase Auth metadata:", err);
    }

    // 2. If role is buddy, create/update buddy profile
    if (dto.role === "buddy") {
      const existingProfile = await db
        .select()
        .from(buddyProfiles)
        .where(eq(buddyProfiles.userId, userId))
        .limit(1);

      const profileData = {
        bio: dto.bio || null,
        city: dto.city || null,
        state: dto.state || null,
        pincode: dto.pincode || null,
        skills: dto.skills || null,
      };

      if (existingProfile.length > 0) {
        const updated = await db
          .update(buddyProfiles)
          .set({
            ...profileData,
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
            ...profileData,
            kycStatus: "pending",
          })
          .returning();

        return { user, profile: created[0] };
      }
    } else if (dto.role === "tasker") {
      const existingProfile = await db
        .select()
        .from(taskers)
        .where(eq(taskers.userId, userId))
        .limit(1);

      const profileData = {
        fullName: dto.fullName,
        city: dto.city || null,
      };

      if (existingProfile.length > 0) {
        const updated = await db
          .update(taskers)
          .set({
            ...profileData,
            updatedAt: new Date(),
          })
          .where(eq(taskers.userId, userId))
          .returning();

        return { user, profile: updated[0] };
      } else {
        const created = await db
          .insert(taskers)
          .values({
            userId,
            ...profileData,
          })
          .returning();

        return { user, profile: created[0] };
      }
    }

    return { user, profile: null };
  }
}

export const userService = new UserService();
