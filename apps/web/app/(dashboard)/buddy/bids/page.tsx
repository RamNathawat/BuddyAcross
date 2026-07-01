"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Clock, CheckCircle2, XCircle, Edit3, IndianRupee, ShieldCheck, MapPin, AlertCircle, Sparkles, Phone } from "lucide-react";
import { toast } from "sonner";
import { useTasks } from "@/lib/hooks/useTasks";
import { updateBid } from "@/lib/api/bids";
import { createClient } from "@/lib/supabase/client";

export default function BuddyMyBidsPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "pending" | "accepted" | "rejected">("all");
  const [editingBidId, setEditingBidId] = useState<string | null>(null);
  const [newAmount, setNewAmount] = useState<string>("");
  const [updating, setUpdating] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    async function getUser() {
      const { data } = await supabase.auth.getUser();
      if (data?.user?.id) {
        setUserId(data.user.id);
      } else {
        const localId = localStorage.getItem("buddy_user_id");
        if (localId) setUserId(localId);
      }
    }
    getUser();
  }, [supabase]);

  const { tasks, loading, error, refetch } = useTasks(userId ? { bidderId: userId } : {});

  const handleUpdateBid = async (bidId: string) => {
    const amt = Number(newAmount);
    if (isNaN(amt) || amt < 300) {
      toast.error("Minimum bid amount is ₹300");
      return;
    }
    setUpdating(true);
    try {
      await updateBid(bidId, { amount: amt });
      toast.success("Bid amount updated successfully!");
      setEditingBidId(null);
      await refetch();
    } catch (err: any) {
      toast.error(err.message || "Failed to update bid");
    } finally {
      setUpdating(false);
    }
  };

  if (loading && !userId) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 py-4 animate-pulse">
        <div className="h-6 bg-muted rounded-md w-32" />
        <div className="h-24 bg-card rounded-2xl border border-border" />
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-40 bg-card rounded-2xl border border-border" />
          ))}
        </div>
      </div>
    );
  }

  const tasksWithMyBid = tasks.filter((t) => t.myBid);
  const filteredTasks = tasksWithMyBid.filter((t) => {
    if (filter === "all") return true;
    return t.myBid?.status === filter;
  });

  return (
    <div className="max-w-4xl mx-auto space-y-6 py-4 animate-fade-in">
      <Link
        href="/buddy"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="size-4" /> Back to Available Tasks Feed
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-2">
            My Bids <Sparkles className="size-6 text-lime-600 dark:text-lime-400" />
          </h1>
          <p className="text-muted-foreground mt-1 text-base">
            Track your submitted proposals and manage pending offers across Bengaluru
          </p>
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {[
          { id: "all", label: "All Proposals", count: tasksWithMyBid.length },
          { id: "pending", label: "Pending Review", count: tasksWithMyBid.filter((t) => t.myBid?.status === "pending").length },
          { id: "accepted", label: "Won & Assigned", count: tasksWithMyBid.filter((t) => t.myBid?.status === "accepted").length },
          { id: "rejected", label: "Not Selected", count: tasksWithMyBid.filter((t) => t.myBid?.status === "rejected").length },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id as any)}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-extrabold transition-all shrink-0 border ${
              filter === tab.id
                ? "bg-lime-400 text-black border-lime-400 shadow-sm glow-lime"
                : "bg-card text-muted-foreground border-border hover:text-foreground hover:border-lime-400/30"
            }`}
          >
            <span>{tab.label}</span>
            <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
              filter === tab.id ? "bg-black/20 text-black" : "bg-secondary text-foreground"
            }`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {filteredTasks.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-border bg-card/40 p-12 text-center space-y-3">
          <div className="mx-auto w-12 h-12 rounded-full bg-secondary flex items-center justify-center text-muted-foreground">
            <Clock className="size-6" />
          </div>
          <h3 className="font-bold text-lg">No bids found in this category</h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
            {filter === "all"
              ? "You haven't bidded on any tasks yet. Browse the live feed to find chores that match your skills."
              : `You don't have any ${filter} bids at the moment.`}
          </p>
          {filter === "all" && (
            <Link
              href="/buddy"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-lime-400 hover:bg-lime-500 text-black font-extrabold text-sm shadow-md hover-glow-btn mt-2"
            >
              Browse Open Tasks Feed
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredTasks.map((t) => {
            const bid = t.myBid;
            if (!bid) return null;
            const isAccepted = bid.status === "accepted";
            const isRejected = bid.status === "rejected";
            const isPending = bid.status === "pending";

            return (
              <div
                key={t.id}
                className={`rounded-2xl border p-6 transition-all shadow-xs space-y-4 ${
                  isAccepted
                    ? "border-lime-400 bg-lime-400/5 shadow-sm"
                    : isRejected
                    ? "border-border/50 bg-secondary/10 opacity-70"
                    : "border-border bg-card hover:border-lime-400/40"
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-bold bg-lime-400/15 text-lime-600 dark:text-lime-400 border-lime-400/30 uppercase">
                      {t.category}
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-muted-foreground">
                      <MapPin className="size-3.5 text-lime-600 dark:text-lime-400" /> {t.zone}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider border ${
                      isAccepted
                        ? "bg-lime-400/20 text-lime-600 dark:text-lime-400 border-lime-400/40"
                        : isPending
                        ? "bg-blue-500/15 text-blue-500 border-blue-500/30"
                        : "bg-secondary text-muted-foreground border-border"
                    }`}>
                      {isAccepted && <CheckCircle2 className="size-3.5" />}
                      {isPending && <Clock className="size-3.5" />}
                      {isRejected && <XCircle className="size-3.5" />}
                      Bid Status: {bid.status}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-1">
                  <div>
                    <Link
                      href={`/buddy/tasks/${t.id}`}
                      className="text-xl font-extrabold text-foreground hover:text-lime-600 dark:hover:text-lime-400 transition-colors line-clamp-1 block"
                    >
                      {t.title}
                    </Link>
                    <p className="text-xs text-muted-foreground line-clamp-1 mt-1">{t.description}</p>
                  </div>

                  <div className="flex items-center gap-6 pt-2 md:pt-0 border-t md:border-t-0 border-border/40 justify-between md:justify-end shrink-0">
                    <div>
                      <div className="text-xs font-bold text-muted-foreground">Task Budget</div>
                      <div className="text-sm font-bold text-foreground">
                        ₹{t.budgetMin} – ₹{t.budgetMax}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-xs font-bold text-muted-foreground">Your Proposed Fee</div>
                      <div className="text-2xl font-extrabold text-lime-600 dark:text-lime-400 flex items-center justify-end">
                        <IndianRupee className="size-5 mr-0.5" />
                        {bid.amount}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Edit Bid Action Row */}
                {isPending && t.status === "open" && (
                  <div className="pt-3 border-t border-border/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <span className="text-xs font-medium text-muted-foreground">
                      Task is still open. You can modify your proposal amount before the Tasker reviews.
                    </span>

                    {editingBidId === bid.id ? (
                      <div className="flex items-center gap-2">
                        <div className="relative">
                          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">₹</span>
                          <input
                            type="number"
                            min={300}
                            value={newAmount}
                            onChange={(e) => setNewAmount(e.target.value)}
                            className="h-9 w-28 rounded-lg border border-border bg-background pl-6 pr-2 text-sm font-bold focus:outline-hidden focus:ring-2 focus:ring-lime-400"
                            placeholder={bid.amount.toString()}
                          />
                        </div>
                        <button
                          type="button"
                          disabled={updating}
                          onClick={() => handleUpdateBid(bid.id)}
                          className="h-9 px-3.5 rounded-lg bg-lime-400 hover:bg-lime-500 text-black font-extrabold text-xs shadow-xs transition-colors disabled:opacity-50"
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingBidId(null)}
                          className="h-9 px-2.5 rounded-lg bg-secondary text-muted-foreground font-bold text-xs"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingBidId(bid.id);
                          setNewAmount(bid.amount.toString());
                        }}
                        className="inline-flex items-center gap-1.5 text-xs font-extrabold text-foreground hover:text-lime-600 dark:hover:text-lime-400 transition-colors bg-secondary/80 px-3.5 py-2 rounded-xl border border-border/60 self-start sm:self-auto"
                      >
                        <Edit3 className="size-3.5" /> Modify Bid Amount
                      </button>
                    )}
                  </div>
                )}

                {/* Winning Bid Contact Reveal Card */}
                {isAccepted && (
                  <div className="p-4 rounded-xl bg-lime-400/10 border border-lime-400/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-sm">
                    <div className="flex items-center gap-2.5 font-bold text-foreground">
                      <ShieldCheck className="size-5 text-lime-600 dark:text-lime-400 shrink-0" />
                      <div>
                        <span>Chore Assigned to You! Contact Tasker to arrange service.</span>
                        <span className="block text-xs font-normal text-muted-foreground mt-0.5">Tasker: {t.tasker?.fullName || "Resident"}</span>
                      </div>
                    </div>
                    <Link
                      href={`/buddy/tasks/${t.id}`}
                      className="px-4 py-2 rounded-xl bg-lime-400 hover:bg-lime-500 text-black font-extrabold text-xs text-center shrink-0 shadow-xs hover-glow-btn"
                    >
                      View Details & Contact
                    </Link>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
