"use client";

import { useState, useCallback } from "react";
import { toast } from "sonner";
import { createBid, updateBid, acceptBid, type CreateBidPayload, type UpdateBidPayload } from "../api/bids";

export function useBids() {
  const [submitting, setSubmitting] = useState(false);

  const placeBid = useCallback(
    async (taskId: string, payload: CreateBidPayload, onSuccess?: () => void) => {
      setSubmitting(true);
      try {
        const res = await createBid(taskId, payload);
        toast.success("Bid submitted successfully!");
        if (onSuccess) onSuccess();
        return res.data;
      } catch (err: any) {
        toast.error(err.message || "Failed to submit bid");
        throw err;
      } finally {
        setSubmitting(false);
      }
    },
    []
  );

  const updateBidAmount = useCallback(
    async (bidId: string, payload: UpdateBidPayload, onSuccess?: () => void) => {
      setSubmitting(true);
      try {
        const res = await updateBid(bidId, payload);
        toast.success("Bid updated successfully!");
        if (onSuccess) onSuccess();
        return res.data;
      } catch (err: any) {
        toast.error(err.message || "Failed to update bid");
        throw err;
      } finally {
        setSubmitting(false);
      }
    },
    []
  );

  const acceptWinningBid = useCallback(
    async (bidId: string, onSuccess?: () => void) => {
      setSubmitting(true);
      try {
        const res = await acceptBid(bidId);
        toast.success("Bid accepted! Contact details revealed.");
        if (onSuccess) onSuccess();
        return res;
      } catch (err: any) {
        toast.error(err.message || "Failed to accept bid");
        throw err;
      } finally {
        setSubmitting(false);
      }
    },
    []
  );

  return {
    submitting,
    placeBid,
    updateBidAmount,
    acceptWinningBid,
  };
}
