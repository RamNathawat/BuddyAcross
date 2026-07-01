import { apiClient } from "../api-client";

export interface TaskerProfile {
  fullName: string;
  avatarUrl?: string | null;
  phone?: string;
  email?: string;
}

export interface BuddyProfile {
  fullName: string;
  avatarUrl?: string | null;
  phone?: string;
  email?: string;
}

export interface Bid {
  id: string;
  taskId: string;
  buddyId: string;
  amount: number;
  message?: string | null;
  status: "pending" | "accepted" | "rejected" | "withdrawn";
  createdAt: string;
  updatedAt: string;
  buddy: BuddyProfile;
}

export interface Task {
  id: string;
  taskerId: string;
  title: string;
  description: string;
  category: string;
  zone: string;
  budgetMin: number;
  budgetMax: number;
  status: "open" | "accepted" | "completed" | "cancelled";
  acceptedBidId?: string | null;
  createdAt: string;
  updatedAt: string;
  bidCount: number;
  tasker: TaskerProfile;
  bids?: Bid[];
  myBid?: Bid | null;
}

export interface GetTasksQuery {
  page?: number;
  limit?: number;
  zone?: string;
  category?: string;
  sortBy?: "createdAt" | "budgetMax";
  sortOrder?: "asc" | "desc";
  status?: string;
  taskerId?: string;
  posterId?: string;
  bidderId?: string;
}

export interface GetTasksResponse {
  success: boolean;
  data: Task[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface CreateTaskPayload {
  title: string;
  description: string;
  category: string;
  zone: string;
  budgetMin: number;
  budgetMax: number;
}

export interface UpdateTaskPayload {
  title?: string;
  description?: string;
  category?: string;
  zone?: string;
  budgetMin?: number;
  budgetMax?: number;
  status?: "open" | "accepted" | "completed" | "cancelled";
}

export async function getTasks(query: GetTasksQuery = {}): Promise<GetTasksResponse> {
  const params = new URLSearchParams();
  if (query.page) params.append("page", query.page.toString());
  if (query.limit) params.append("limit", query.limit.toString());
  if (query.zone && query.zone !== "All") params.append("zone", query.zone);
  if (query.category && query.category !== "All") params.append("category", query.category);
  if (query.sortBy) params.append("sortBy", query.sortBy);
  if (query.sortOrder) params.append("sortOrder", query.sortOrder);
  if (query.status) params.append("status", query.status);
  if (query.taskerId) params.append("taskerId", query.taskerId);
  if (query.posterId) params.append("posterId", query.posterId);
  if (query.bidderId) params.append("bidderId", query.bidderId);

  const queryString = params.toString() ? `?${params.toString()}` : "";
  return apiClient<GetTasksResponse>(`/tasks${queryString}`);
}

export async function getTaskById(taskId: string): Promise<{ success: boolean; data: Task }> {
  return apiClient<{ success: boolean; data: Task }>(`/tasks/${taskId}`);
}

export async function createTask(payload: CreateTaskPayload): Promise<{ success: boolean; data: Task }> {
  return apiClient<{ success: boolean; data: Task }>("/tasks", {
    method: "POST",
    body: payload,
  });
}

export async function updateTask(
  taskId: string,
  payload: UpdateTaskPayload
): Promise<{ success: boolean; data: Task }> {
  return apiClient<{ success: boolean; data: Task }>(`/tasks/${taskId}`, {
    method: "PATCH",
    body: payload,
  });
}
