"use client";

import { use, useState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, Clock, MapPin, IndianRupee, Phone, User, MessageSquare, ShieldCheck, AlertCircle, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { useTask } from "@/lib/hooks/useTask";
import { acceptBid } from "@/lib/api/bids";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function TaskerTaskDetailsPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const taskId = resolvedParams.id;
  const { task, loading, error, refetch } = useTask(taskId);
  const [acceptingBidId, setAcceptingBidId] = useState<string | null>(null);

  const handleAcceptBid = async (bidId: string, buddyName: string) => {
    if (confirm(`Are you sure you want to accept ${buddyName}'s bid? This will assign the chore and unlock contact details.`)) {
      setAcceptingBidId(bidId);
      try {
        await acceptBid(bidId);
        toast.success(`🎉 Bid accepted! You can now contact ${buddyName} directly.`);
        await refetch();
      } catch (err: any) {
        toast.error(err.message || "Failed to accept bid");
      } finally {
        setAcceptingBidId(null);
      }
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 py-4 animate-pulse">
        <div className="h-6 bg-muted rounded-md w-32" />
        <div className="h-44 rounded-2xl bg-card border border-border p-6 space-y-4">
          <div className="h-8 bg-muted rounded-md w-2/3" />
          <div className="h-4 bg-muted rounded-md w-full" />
          <div className="h-4 bg-muted rounded-md w-3/4" />
        </div>
        <div className="h-64 rounded-2xl bg-card border border-border p-6" />
      </div>
    );
  }

  if (error || !task) {
    return (
      <div className="max-w-4xl mx-auto py-12 text-center space-y-4">
        <div className="mx-auto w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center text-destructive">
          <AlertCircle className="size-6" />
        </div>
        <h2 className="text-xl font-bold">Task Not Found</h2>
        <p className="text-sm text-muted-foreground">{error || "The task you are looking for does not exist or you lack permission."}</p>
        <Link
          href="/tasker"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-secondary hover:bg-secondary/80 text-foreground font-bold text-sm"
        >
          <ArrowLeft className="size-4" /> Return to Dashboard
        </Link>
      </div>
    );
  }

  const bids = task.bids || [];
  const acceptedBid = bids.find((b) => b.status === "accepted");

  return (
    <div className="max-w-4xl mx-auto space-y-6 py-4 animate-fade-in">
      <Link
        href="/tasker"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="size-4" /> Back to Your Tasks
      </Link>

      {/* Task Header Card */}
      <div className="rounded-2xl border border-border bg-card text-card-foreground p-6 md:p-8 shadow-sm space-y-6 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center rounded-md border px-3 py-1 text-xs font-bold bg-lime-400/15 text-lime-600 dark:text-lime-400 border-lime-400/30 uppercase tracking-wider">
              {task.category}
            </span>
            <span className="inline-flex items-center gap-1 rounded-md border px-3 py-1 text-xs font-bold bg-secondary text-foreground border-border">
              <MapPin className="size-3 text-lime-600 dark:text-lime-400" /> {task.zone}
            </span>
          </div>

          <span className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-extrabold uppercase tracking-wider border self-start sm:self-auto ${
            task.status === "open"
              ? "bg-blue-500/15 text-blue-500 border-blue-500/30 animate-pulse"
              : task.status === "accepted"
              ? "bg-lime-400/20 text-lime-600 dark:text-lime-400 border-lime-400/40"
              : "bg-secondary text-muted-foreground border-border"
          }`}>
            {task.status === "accepted" && <CheckCircle2 className="size-4" />}
            {task.status === "open" && <Clock className="size-3.5" />}
            Status: {task.status}
          </span>
        </div>

        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">{task.title}</h1>
          <p className="text-base text-muted-foreground mt-3 leading-relaxed whitespace-pre-wrap">
            {task.description}
          </p>
        </div>

        <div className="pt-4 border-t border-border/60 flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-0.5">
            <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Budget Range</div>
            <div className="text-xl font-extrabold flex items-center text-foreground">
              <IndianRupee className="size-5 text-lime-600 dark:text-lime-400 mr-0.5" />
              {task.budgetMin === task.budgetMax ? task.budgetMin : `${task.budgetMin} – ₹${task.budgetMax}`}
            </div>
          </div>

          <div className="text-right space-y-0.5">
            <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Posted On</div>
            <div className="text-sm font-bold text-foreground">
              {new Date(task.createdAt).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Accepted Bid / Contact Reveal Banner */}
      {task.status === "accepted" && acceptedBid && (
        <div className="rounded-2xl border-2 border-lime-400 bg-gradient-to-r from-lime-400/15 via-background to-card p-6 md:p-8 shadow-md relative overflow-hidden space-y-4 animate-fade-in">
          <div className="flex items-center gap-2 text-lime-600 dark:text-lime-400 font-extrabold text-base">
            <Sparkles className="size-5" /> Chore Assigned & Confirmed
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-background/80 p-5 rounded-xl border border-border">
            <div className="flex items-center gap-3.5">
              <div className="size-12 rounded-full bg-lime-400/20 border-2 border-lime-400 flex items-center justify-center font-bold text-lg text-lime-600 dark:text-lime-400">
                {acceptedBid.buddy?.fullName?.charAt(0) || "B"}
              </div>
              <div>
                <div className="font-extrabold text-lg flex items-center gap-1.5">
                  {acceptedBid.buddy?.fullName || "Verified Buddy"}
                  <ShieldCheck className="size-4 text-lime-600 dark:text-lime-400" />
                </div>
                <div className="text-xs text-muted-foreground">KYC Verified Neighborhood Buddy</div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
              {acceptedBid.buddy?.phone && (
                <a
                  href={`tel:${acceptedBid.buddy.phone}`}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-lime-400 hover:bg-lime-500 text-black font-extrabold text-sm shadow-md transition-all hover:shadow-lg w-full sm:w-auto hover-glow-btn"
                >
                  <Phone className="size-4" /> Call {acceptedBid.buddy.phone}
                </a>
              )}
              {acceptedBid.buddy?.email && (
                <a
                  href={`mailto:${acceptedBid.buddy.email}`}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-background border border-border hover:bg-secondary text-foreground font-extrabold text-sm shadow-xs transition-all w-full sm:w-auto"
                >
                  Email {acceptedBid.buddy.email}
                </a>
              )}
              {!acceptedBid.buddy?.phone && !acceptedBid.buddy?.email && (
                <div className="text-sm font-bold text-muted-foreground">Contact details pending</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Incoming Bids Section */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-extrabold tracking-tight">Incoming Bids ({bids.length})</h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              Compare offers and accept the best Buddy for your chore
            </p>
          </div>
        </div>

        {bids.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-border bg-card/40 p-12 text-center space-y-3">
            <div className="mx-auto w-12 h-12 rounded-full bg-secondary flex items-center justify-center text-muted-foreground">
              <User className="size-6" />
            </div>
            <h3 className="font-bold text-lg">No bids received yet</h3>
            <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
              Buddies in <span className="font-bold text-foreground">{task.zone}</span> have been notified. Check back soon as local helpers submit their proposals.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {bids.map((b) => {
              const isAccepted = b.status === "accepted";
              const isRejected = b.status === "rejected";
              const isPending = b.status === "pending";

              return (
                <div
                  key={b.id}
                  className={`rounded-2xl border p-6 transition-all shadow-xs space-y-4 ${
                    isAccepted
                      ? "border-lime-400 bg-lime-400/5 shadow-sm"
                      : isRejected
                      ? "border-border/50 bg-secondary/20 opacity-60"
                      : "border-border bg-card hover:border-lime-400/40"
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5">
                      <div className={`size-11 rounded-full flex items-center justify-center font-bold text-base ${
                        isAccepted ? "bg-lime-400 text-black" : "bg-secondary text-foreground"
                      }`}>
                        {b.buddy?.fullName?.charAt(0) || "B"}
                      </div>
                      <div>
                        <div className="font-extrabold text-base flex items-center gap-1.5">
                          {b.buddy?.fullName || "Verified Buddy"}
                          <ShieldCheck className="size-4 text-lime-600 dark:text-lime-400" />
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Bidded on {new Date(b.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 self-end sm:self-auto">
                      <div className="text-right">
                        <div className="text-xs font-bold text-muted-foreground">Proposed Fee</div>
                        <div className="text-xl font-extrabold text-foreground flex items-center justify-end">
                          <IndianRupee className="size-4 text-lime-600 dark:text-lime-400 mr-0.5" />
                          {b.amount}
                        </div>
                      </div>

                      {isAccepted && (
                        <span className="px-3.5 py-1.5 rounded-full bg-lime-400 text-black font-extrabold text-xs">
                          ✓ Assigned Buddy
                        </span>
                      )}

                      {isRejected && (
                        <span className="px-3 py-1 rounded-full bg-secondary text-muted-foreground font-bold text-xs">
                          Not Selected
                        </span>
                      )}

                      {task.status === "open" && isPending && (
                        <button
                          type="button"
                          disabled={acceptingBidId !== null}
                          onClick={() => handleAcceptBid(b.id, b.buddy?.fullName || "Buddy")}
                          className="px-5 py-2.5 rounded-xl bg-lime-400 hover:bg-lime-500 text-black font-extrabold text-sm shadow-sm transition-all hover:shadow-md disabled:opacity-50 hover-glow-btn"
                        >
                          {acceptingBidId === b.id ? "Accepting..." : `Accept Bid (₹${b.amount})`}
                        </button>
                      )}
                    </div>
                  </div>

                  {b.message && (
                    <div className="p-3.5 rounded-xl bg-secondary/40 border border-border/40 text-sm leading-relaxed text-foreground flex items-start gap-2.5">
                      <MessageSquare className="size-4 text-muted-foreground shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-xs text-muted-foreground block mb-0.5">Note from Buddy:</span>
                        {b.message}
                      </div>
                    </div>
                  )}

                  {isAccepted && b.buddy?.phone && (
                    <div className="pt-3 border-t border-border/60 flex items-center justify-between text-sm font-bold">
                      <span className="text-muted-foreground">Unlocked Contact Number:</span>
                      <a href={`tel:${b.buddy.phone}`} className="text-lime-600 dark:text-lime-400 hover:underline flex items-center gap-1.5">
                        <Phone className="size-4" /> {b.buddy.phone}
                      </a>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
