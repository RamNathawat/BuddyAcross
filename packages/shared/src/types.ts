import type {
  UserRole,
  TaskStatus,
  BidStatus,
  EscrowStatus,
  KycStatus,
  TaskCategory,
} from "./constants";

// ============================================================
// API Response Wrapper
// ============================================================
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ============================================================
// User
// ============================================================
export interface User {
  id: string;
  phone: string | null;
  email: string | null;
  fullName: string;
  avatarUrl: string | null;
  role: UserRole | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// ============================================================
// Buddy Profile
// ============================================================
export interface BuddyProfile {
  id: string;
  userId: string;
  bio: string | null;
  city: string;
  state: string;
  pincode: string;
  skills: string[];
  kycStatus: KycStatus;
  createdAt: string;
  updatedAt: string;
}

// ============================================================
// Tasker Profile
// ============================================================
export interface TaskerProfile {
  id: string;
  userId: string;
  fullName: string;
  city: string | null;
  createdAt: string;
  updatedAt: string;
}

// ============================================================
// KYC Submission
// ============================================================
export interface KycSubmission {
  id: string;
  buddyId: string;
  aadhaarFront: string;
  aadhaarBack: string;
  selfie: string;
  status: KycStatus;
  rejectionReason: string | null;
  submittedAt: string;
  reviewedAt: string | null;
  reviewedBy: string | null;
  accountHolder?: string | null;
  accountNumber?: string | null;
  ifscCode?: string | null;
  emergencyName?: string | null;
  emergencyPhone?: string | null;
  skills?: string[] | null;
  zones?: string[] | null;
  submittedAgo?: string | null;
}

// ============================================================
// Combined User with Profile (for /users/me endpoint)
// ============================================================
export interface CurrentUserResponse {
  user: User;
  profile?: BuddyProfile | TaskerProfile | null;
  kyc?: KycSubmission | null;
}

// ============================================================
// Task
// ============================================================
export interface Task {
  id: string;
  taskerId: string;
  title: string;
  description: string;
  category: TaskCategory;
  zone: string;
  budgetMin: number;
  budgetMax: number;
  status: TaskStatus;
  acceptedBidId: string | null;
  locationLat?: number;
  locationLng?: number;
  locationAddress?: string;
  assignedBuddyId?: string | null;
  imageUrls?: string[];
  completedAt?: string | null;
  cancelledAt?: string | null;
  cancellationReason?: string | null;
  createdAt: string;
  updatedAt: string;
}

// ============================================================
// Bid
// ============================================================
export interface Bid {
  id: string;
  taskId: string;
  buddyId: string;
  amount: number;
  message: string | null;
  status: BidStatus;
  estimatedDuration?: string | null;
  createdAt: string;
  updatedAt: string;
}

// ============================================================
// Escrow
// ============================================================
export interface EscrowTransaction {
  id: string;
  taskId: string;
  taskerId: string;
  buddyId: string;
  amount: number;
  upiReference: string | null;
  status: EscrowStatus;
  confirmedBy: string | null;
  confirmedAt: string | null;
  releasedBy: string | null;
  releasedAt: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

// ============================================================
// Chat
// ============================================================
export interface Conversation {
  id: string;
  taskId: string;
  taskerId: string;
  buddyId: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  isRead: boolean;
  createdAt: string;
}

// ============================================================
// Review
// ============================================================
export interface Review {
  id: string;
  taskId: string;
  reviewerId: string;
  revieweeId: string;
  rating: number;
  comment: string | null;
  isFlagged: boolean;
  isVisible: boolean;
  createdAt: string;
  updatedAt: string;
}

// ============================================================
// Strike
// ============================================================
export interface Strike {
  id: string;
  userId: string;
  issuedBy: string;
  reason: string;
  relatedReviewId: string | null;
  relatedTaskId: string | null;
  createdAt: string;
}
