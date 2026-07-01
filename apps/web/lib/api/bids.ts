import { apiClient } from "../api-client";
import type { Bid } from "./tasks";

export interface CreateBidPayload {
  amount: number;
  message?: string | null;
}

export interface UpdateBidPayload {
  amount?: number;
  message?: string | null;
}

export async function createBid(
  taskId: string,
  payload: CreateBidPayload
): Promise<{ success: boolean; data: Bid }> {
  return apiClient<{ success: boolean; data: Bid }>(`/tasks/${taskId}/bids`, {
    method: "POST",
    body: payload,
  });
}

export async function updateBid(
  bidId: string,
  payload: UpdateBidPayload
): Promise<{ success: boolean; data: Bid }> {
  return apiClient<{ success: boolean; data: Bid }>(`/bids/${bidId}`, {
    method: "PATCH",
    body: payload,
  });
}

export async function acceptBid(
  bidId: string
): Promise<{ success: boolean; taskId: string; bidId: string }> {
  return apiClient<{ success: boolean; taskId: string; bidId: string }>(
    `/bids/${bidId}/accept`,
    {
      method: "POST",
      body: {},
    }
  );
}
