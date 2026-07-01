// ============================================================
// User Roles
// ============================================================
export const USER_ROLES = {
  TASKER: "tasker",
  BUDDY: "buddy",
  ADMIN: "admin",
} as const;

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];

// ============================================================
// Task Status
// ============================================================
export const TASK_STATUS = {
  OPEN: "open",
  DRAFT: "draft",
  POSTED: "posted",
  BID_RECEIVED: "bid_received",
  ACCEPTED: "accepted",
  ESCROW_PENDING: "escrow_pending",
  IN_PROGRESS: "in_progress",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
  DISPUTED: "disputed",
} as const;

export type TaskStatus = (typeof TASK_STATUS)[keyof typeof TASK_STATUS];

// ============================================================
// Bid Status
// ============================================================
export const BID_STATUS = {
  PENDING: "pending",
  ACCEPTED: "accepted",
  REJECTED: "rejected",
  WITHDRAWN: "withdrawn",
} as const;

export type BidStatus = (typeof BID_STATUS)[keyof typeof BID_STATUS];

// ============================================================
// Escrow Status
// ============================================================
export const ESCROW_STATUS = {
  PENDING: "pending",
  CONFIRMED: "confirmed",
  RELEASED: "released",
  REFUNDED: "refunded",
  DISPUTED: "disputed",
} as const;

export type EscrowStatus = (typeof ESCROW_STATUS)[keyof typeof ESCROW_STATUS];

// ============================================================
// KYC Status
// ============================================================
export const KYC_STATUS = {
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
  RESUBMISSION_REQUESTED: "resubmission_requested",
} as const;

export type KycStatus = (typeof KYC_STATUS)[keyof typeof KYC_STATUS];

// ============================================================
// Task Categories / Buddy Skills
// ============================================================
export const TASK_CATEGORIES = [
  { value: "cleaning", label: "Cleaning" },
  { value: "delivery", label: "Delivery" },
  { value: "repairs", label: "Repairs" },
  { value: "moving", label: "Moving" },
  { value: "shopping", label: "Shopping" },
  { value: "assembly", label: "Furniture Assembly" },
  { value: "painting", label: "Painting" },
  { value: "gardening", label: "Gardening" },
  { value: "errands", label: "Errands" },
  { value: "other", label: "Other" },
  { value: "Home Cleaning", label: "Home Cleaning" },
  { value: "Package Delivery", label: "Package Delivery" },
  { value: "Plumbing & Repairs", label: "Plumbing & Repairs" },
  { value: "Electrical Works", label: "Electrical Works" },
  { value: "Pet Sitting", label: "Pet Sitting" },
  { value: "Tutoring & Education", label: "Tutoring & Education" },
  { value: "Tech Support", label: "Tech Support" },
  { value: "Carpentry", label: "Carpentry" },
  { value: "Event Assistance", label: "Event Assistance" },
  { value: "Cook / Chef", label: "Cook / Chef" },
] as const;

export type TaskCategory = (typeof TASK_CATEGORIES)[number]["value"];

// ============================================================
// App Constants
// ============================================================
export const APP_CONFIG = {
  MIN_TASK_BUDGET: 300,
  DEFAULT_ZONE_RADIUS_KM: 5,
  MAX_FILE_SIZE_MB: 5,
  MAX_RATING: 5,
  MIN_RATING: 1,
  ESCROW_TIMEOUT_HOURS: 24,
  REVIEW_WINDOW_DAYS: 7,
  MAX_STRIKES_BEFORE_SUSPENSION: 3,
} as const;
