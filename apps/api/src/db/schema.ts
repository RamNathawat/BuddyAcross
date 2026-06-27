import {
  pgTable,
  uuid,
  varchar,
  text,
  boolean,
  timestamp,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ============================================================
// Users Table
// ============================================================
export const users = pgTable(
  "users",
  {
    id: uuid("id").primaryKey(), // Matches Supabase auth.users.id
    phone: varchar("phone", { length: 20 }),
    email: varchar("email", { length: 255 }),
    fullName: varchar("full_name", { length: 100 }).notNull(),
    role: varchar("role", { length: 20 }), // 'tasker' | 'buddy' | 'admin'
    avatarUrl: text("avatar_url"),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("users_role_idx").on(table.role),
    index("users_phone_idx").on(table.phone),
    index("users_email_idx").on(table.email),
  ]
);

export const usersRelations = relations(users, ({ one }) => ({
  buddyProfile: one(buddyProfiles, {
    fields: [users.id],
    references: [buddyProfiles.userId],
  }),
}));

// ============================================================
// Buddy Profiles Table
// ============================================================
export const buddyProfiles = pgTable(
  "buddy_profiles",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" })
      .unique(),
    bio: text("bio"),
    city: varchar("city", { length: 100 }),
    state: varchar("state", { length: 100 }),
    pincode: varchar("pincode", { length: 10 }),
    skills: text("skills").array(),
    kycStatus: varchar("kyc_status", { length: 30 }).default("pending").notNull(), // 'pending' | 'approved' | 'rejected' | 'resubmission_requested'
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("buddy_profiles_user_id_idx").on(table.userId),
    index("buddy_profiles_city_idx").on(table.city),
    index("buddy_profiles_kyc_status_idx").on(table.kycStatus),
  ]
);

export const buddyProfilesRelations = relations(
  buddyProfiles,
  ({ one, many }) => ({
    user: one(users, {
      fields: [buddyProfiles.userId],
      references: [users.id],
    }),
    kycSubmissions: many(kycSubmissions),
  })
);

// ============================================================
// KYC Submissions Table
// ============================================================
export const kycSubmissions = pgTable(
  "kyc_submissions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    buddyId: uuid("buddy_id")
      .notNull()
      .references(() => buddyProfiles.id, { onDelete: "cascade" }),
    aadhaarFront: text("aadhaar_front").notNull(),
    aadhaarBack: text("aadhaar_back").notNull(),
    selfie: text("selfie").notNull(),
    accountHolder: varchar("account_holder", { length: 150 }),
    accountNumber: varchar("account_number", { length: 50 }),
    ifscCode: varchar("ifsc_code", { length: 20 }),
    emergencyName: varchar("emergency_name", { length: 150 }),
    emergencyPhone: varchar("emergency_phone", { length: 30 }),
    skills: text("skills").array(),
    zones: text("zones").array(),
    submittedAgo: varchar("submitted_ago", { length: 50 }).default("Just now"),
    rejectionReason: text("rejection_reason"),
    status: varchar("status", { length: 30 }).default("pending").notNull(), // 'pending' | 'approved' | 'rejected' | 'resubmission_requested'
    submittedAt: timestamp("submitted_at").defaultNow().notNull(),
    reviewedAt: timestamp("reviewed_at"),
    reviewedBy: uuid("reviewed_by").references(() => users.id, {
      onDelete: "set null",
    }),
  },
  (table) => [
    index("kyc_submissions_buddy_id_idx").on(table.buddyId),
    index("kyc_submissions_status_idx").on(table.status),
  ]
);

export const kycSubmissionsRelations = relations(
  kycSubmissions,
  ({ one }) => ({
    buddyProfile: one(buddyProfiles, {
      fields: [kycSubmissions.buddyId],
      references: [buddyProfiles.id],
    }),
    reviewer: one(users, {
      fields: [kycSubmissions.reviewedBy],
      references: [users.id],
    }),
  })
);
