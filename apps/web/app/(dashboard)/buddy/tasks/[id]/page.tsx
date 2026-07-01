"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, MapPin, Calendar, IndianRupee, ShieldCheck, CheckCircle2, PhoneCall } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useTask } from "@/lib/hooks/useTask";
import { useBids } from "@/lib/hooks/useBids";

export default function BuddyTaskDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const taskId = Array.isArray(params?.id) ? params.id[0] : (params?.id as string);

  const { task, loading, error, refetch } = useTask(taskId);
  const { placeBid, submitting } = useBids();

  const [price, setPrice] = useState<string>("");
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    if (task && !price) {
      setPrice(task.budgetMax.toString());
    }
  }, [task, price]);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto space-y-6 py-4 animate-pulse">
        <div className="h-6 w-24 bg-muted rounded-md" />
        <div className="h-8 w-3/4 bg-muted rounded-md" />
        <div className="h-40 w-full bg-muted rounded-xl" />
        <div className="h-64 w-full bg-muted rounded-xl" />
      </div>
    );
  }

  if (error || !task) {
    return (
      <div className="max-w-3xl mx-auto py-12 text-center">
        <Card className="p-8 border-2 border-destructive/20 bg-destructive/5">
          <p className="text-sm font-bold text-destructive">{error || "Task not found"}</p>
          <Link
            href="/buddy"
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-background border border-border text-xs font-bold shadow-xs hover:bg-accent"
          >
            <ArrowLeft className="size-4" /> Return to Feed
          </Link>
        </Card>
      </div>
    );
  }

  const isAccepted = task.status === "accepted";
  const hasMyBid = !!task.myBid;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = Number(price);
    if (!amount || amount < 300) return;

    try {
      await placeBid(task.id, { amount, message: message.trim() || undefined });
      refetch();
      router.push("/buddy");
    } catch {}
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 py-4 animate-fade-in">
      <Link
        href="/buddy"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="size-4" /> Back to open tasks
      </Link>

      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">
          {hasMyBid ? "Your Submitted Bid" : isAccepted ? "Chore Assigned" : "Place your bid"}
        </h1>
        <p className="text-muted-foreground mt-1 text-base font-medium">{task.title}</p>
      </div>

      {/* Task Summary Card */}
      <div className="rounded-xl border border-border bg-card text-card-foreground shadow-sm">
        <div className="p-6">
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground border-b border-border/60 pb-4">
            <span className="flex items-center gap-1.5 font-bold text-lime-600 dark:text-lime-400 bg-lime-400/10 px-2.5 py-1 rounded-md">
              <MapPin className="size-4" /> {task.zone}
            </span>
            <span className="flex items-center gap-1.5 font-medium">
              <Calendar className="size-4 text-muted-foreground" />
              Posted {new Date(task.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
            </span>
            <span className="flex items-center gap-0.5 font-extrabold text-foreground ml-auto bg-secondary px-3 py-1 rounded-full">
              <IndianRupee className="size-4 text-lime-600 dark:text-lime-400" />
              {task.budgetMin === task.budgetMax ? task.budgetMin : `${task.budgetMin}–${task.budgetMax}`} (posted budget)
            </span>
          </div>
          <div className="mt-4 space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Chore Details</h4>
            <p className="text-sm leading-relaxed text-foreground/90 whitespace-pre-wrap font-normal">
              {task.description}
            </p>
          </div>
          <div className="mt-4 pt-4 border-t border-border/60 flex items-center justify-between text-xs text-muted-foreground">
            <span>Posted by <strong className="text-foreground">{task.tasker.fullName}</strong></span>
            <span className="inline-flex items-center gap-1 text-lime-600 dark:text-lime-400 font-bold">
              <ShieldCheck className="size-3.5" /> Verified Resident
            </span>
          </div>
        </div>
      </div>

      {/* Accepted Status / Contact Reveal Card */}
      {isAccepted && (
        <Card className="border-2 border-lime-400/60 bg-gradient-to-br from-lime-400/15 via-background to-card p-6 shadow-md">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-lime-400 text-black shrink-0 font-bold shadow-xs">
                <CheckCircle2 className="size-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-extrabold text-foreground">Chore Assigned & Accepted</h3>
                <p className="text-sm text-muted-foreground">
                  This task has been assigned. Coordinate directly with the Poster to complete the chore.
                </p>
                {task.tasker?.phone && (
                  <div className="pt-2 font-bold text-lime-600 dark:text-lime-400 flex items-center gap-2">
                    <span>Tasker Phone Revealed:</span>
                    <a href={`tel:${task.tasker.phone}`} className="underline font-extrabold flex items-center gap-1">
                      <PhoneCall className="size-4" /> {task.tasker.phone}
                    </a>
                  </div>
                )}
                {task.tasker?.email && (
                  <div className="pt-1 font-bold text-muted-foreground flex items-center gap-2 text-xs">
                    <span>Tasker Email:</span>
                    <a href={`mailto:${task.tasker.email}`} className="underline font-bold">
                      {task.tasker.email}
                    </a>
                  </div>
                )}
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-2 shrink-0">
              {task.tasker?.phone && (
                <a
                  href={`tel:${task.tasker.phone}`}
                  className="px-4 py-2.5 rounded-xl bg-lime-400 hover:bg-lime-500 text-black font-extrabold text-sm shadow-md hover-glow-btn inline-flex items-center gap-2"
                >
                  <PhoneCall className="size-4" /> Call Tasker
                </a>
              )}
              {task.tasker?.email && (
                <a
                  href={`mailto:${task.tasker.email}`}
                  className="px-4 py-2.5 rounded-xl bg-background border border-border hover:bg-secondary text-foreground font-extrabold text-sm shadow-xs inline-flex items-center gap-2"
                >
                  Email Tasker
                </a>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* Bid Form or Active Bid Display */}
      {hasMyBid ? (
        <Card className="border-2 border-border p-6 space-y-4 bg-card/80">
          <div className="flex items-center justify-between border-b border-border/60 pb-3">
            <span className="text-sm font-bold text-muted-foreground">Your Submitted Offer</span>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-lime-400/20 text-lime-600 dark:text-lime-400 border border-lime-400/30">
              {task.myBid?.status}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Bid Price</span>
            <span className="text-xl font-extrabold flex items-center text-foreground">
              <IndianRupee className="size-5 text-lime-600 dark:text-lime-400 mr-0.5" />
              {task.myBid?.amount}
            </span>
          </div>
          {task.myBid?.message && (
            <div className="space-y-1 pt-2">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Your Message</span>
              <p className="text-sm text-foreground bg-secondary/40 p-3 rounded-xl border border-border/40">
                {task.myBid.message}
              </p>
            </div>
          )}
        </Card>
      ) : !isAccepted ? (
        <form onSubmit={handleSubmit} className="rounded-xl border border-border bg-card text-card-foreground shadow-sm p-6 space-y-5">
          <div className="space-y-2">
            <label htmlFor="price" className="text-sm font-bold text-foreground flex items-center justify-between">
              <span>Your price (₹)</span>
              <span className="text-xs font-normal text-muted-foreground">Min. ₹300</span>
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground font-bold">₹</span>
              <input
                id="price"
                type="number"
                min={300}
                required
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="flex h-11 w-full rounded-xl border border-border bg-background pl-8 pr-4 text-base font-bold shadow-xs transition-colors placeholder:text-muted-foreground focus:outline-hidden focus:ring-2 focus:ring-lime-400"
                placeholder="450"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="message" className="text-sm font-bold text-foreground">
              Short message to the Poster
            </label>
            <textarea
              id="message"
              rows={3}
              maxLength={500}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="flex min-h-[80px] w-full rounded-xl border border-border bg-background p-3.5 text-sm shadow-xs placeholder:text-muted-foreground focus:outline-hidden focus:ring-2 focus:ring-lime-400 leading-relaxed"
              placeholder="Available today after 3pm, have a bike, done this before..."
            />
          </div>

          <button
            type="submit"
            disabled={submitting || !price || Number(price) < 300}
            className="inline-flex items-center justify-center gap-2 rounded-xl text-sm font-extrabold shadow-md h-11 px-6 bg-lime-400 hover:bg-lime-500 text-black w-full transition-all hover:shadow-lg disabled:opacity-50 disabled:pointer-events-none hover-glow-btn"
          >
            {submitting ? "Submitting bid..." : "Submit bid"}
          </button>
        </form>
      ) : null}
    </div>
  );
}
