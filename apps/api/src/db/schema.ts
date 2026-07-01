import {
  pgTable,
  uuid,
  varchar,
  text,
  boolean,
  integer,
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

export const usersRelations = relations(users, ({ one, many }) => ({
  buddyProfile: one(buddyProfiles, {
    fields: [users.id],
    references: [buddyProfiles.userId],
  }),
  taskerProfile: one(taskers, {
    fields: [users.id],
    references: [taskers.userId],
  }),
  tasks: many(tasks),
  bids: many(bids),
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

// ============================================================
// Taskers Table
// ============================================================
export const taskers = pgTable(
  "taskers",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" })
      .unique(),
    fullName: varchar("full_name", { length: 100 }).notNull(),
    city: varchar("city", { length: 100 }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("taskers_user_id_idx").on(table.userId),
  ]
);

export const taskersRelations = relations(taskers, ({ one }) => ({
  user: one(users, {
    fields: [taskers.userId],
    references: [users.id],
  }),
}));

// ============================================================
// Tasks Table
// ============================================================
export const tasks = pgTable(
  "tasks",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    taskerId: uuid("tasker_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    title: varchar("title", { length: 100 }).notNull(),
    description: text("description").notNull(),
    category: varchar("category", { length: 50 }).notNull(),
    zone: varchar("zone", { length: 100 }).notNull(),
    budgetMin: integer("budget_min").notNull(),
    budgetMax: integer("budget_max").notNull(),
    status: varchar("status", { length: 30 }).default("open").notNull(),
    acceptedBidId: uuid("accepted_bid_id"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("tasks_tasker_id_idx").on(table.taskerId),
    index("tasks_status_idx").on(table.status),
    index("tasks_zone_idx").on(table.zone),
    index("tasks_category_idx").on(table.category),
    index("tasks_created_at_idx").on(table.createdAt),
  ]
);

export const tasksRelations = relations(tasks, ({ one, many }) => ({
  tasker: one(users, {
    fields: [tasks.taskerId],
    references: [users.id],
  }),
  bids: many(bids),
}));

// ============================================================
// Bids Table
// ============================================================
export const bids = pgTable(
  "bids",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    taskId: uuid("task_id")
      .notNull()
      .references(() => tasks.id, { onDelete: "cascade" }),
    buddyId: uuid("buddy_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    amount: integer("amount").notNull(),
    message: text("message"),
    status: varchar("status", { length: 30 }).default("pending").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("bids_task_id_idx").on(table.taskId),
    index("bids_buddy_id_idx").on(table.buddyId),
    index("bids_status_idx").on(table.status),
  ]
);

export const bidsRelations = relations(bids, ({ one }) => ({
  task: one(tasks, {
    fields: [bids.taskId],
    references: [tasks.id],
  }),
  buddy: one(users, {
    fields: [bids.buddyId],
    references: [users.id],
  }),
}));

