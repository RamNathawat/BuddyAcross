"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Sparkles, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { createTask } from "@/lib/api/tasks";
import { HYPERLOCAL_ZONES } from "@/lib/constants/zones";
import { TASK_CATEGORIES } from "@buddyacross/shared";

export default function PostTaskPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<string>("errands");
  const [zone, setZone] = useState<string>(HYPERLOCAL_ZONES[0]);
  const [budgetMin, setBudgetMin] = useState<string>("400");
  const [budgetMax, setBudgetMax] = useState<string>("600");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const min = Number(budgetMin);
    const max = Number(budgetMax);

    if (min < 300 || max < 300) {
      setError("Minimum budget required is ₹300 per task.");
      return;
    }
    if (max < min) {
      setError("Maximum budget cannot be less than minimum budget.");
      return;
    }
    if (title.trim().length < 5) {
      setError("Title must be at least 5 characters long.");
      return;
    }
    if (description.trim().length < 10) {
      setError("Description must be at least 10 characters long.");
      return;
    }

    setSubmitting(true);
    try {
      await createTask({
        title: title.trim(),
        description: description.trim(),
        category,
        zone,
        budgetMin: min,
        budgetMax: max,
      });
      toast.success("Task posted successfully! Buddies in your zone are being notified.");
      router.push("/tasker");
    } catch (err: any) {
      setError(err.message || "Failed to post task. Please check input parameters.");
      toast.error(err.message || "Failed to post task");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 py-4 animate-fade-in">
      <Link
        href="/tasker"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="size-4" /> Back to Dashboard
      </Link>

      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-2">
            Post a new task <Sparkles className="size-6 text-lime-600 dark:text-lime-400" />
          </h1>
          <p className="text-muted-foreground mt-1 text-base">
            Tell verified neighborhood Buddies what you need done in Bengaluru
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl border border-destructive/30 bg-destructive/10 text-destructive flex items-center gap-3 text-sm font-bold animate-shake">
          <AlertCircle className="size-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="rounded-xl border border-border bg-card text-card-foreground shadow-sm">
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <label htmlFor="title" className="text-sm font-bold text-foreground">
              Task title
            </label>
            <input
              id="title"
              type="text"
              required
              minLength={5}
              maxLength={100}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="flex h-11 w-full rounded-xl border border-border bg-background px-3.5 text-base font-medium shadow-xs transition-colors placeholder:text-muted-foreground focus:outline-hidden focus:ring-2 focus:ring-lime-400"
              placeholder="Pick up dry cleaning from HSR and drop at Koramangala"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-bold text-foreground">
              Description
            </label>
            <textarea
              id="description"
              required
              minLength={10}
              maxLength={2000}
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="flex min-h-[100px] w-full rounded-xl border border-border bg-background p-3.5 text-sm shadow-xs placeholder:text-muted-foreground focus:outline-hidden focus:ring-2 focus:ring-lime-400 leading-relaxed"
              placeholder="Add details — address landmark, preferred timing, item dimensions or special care instructions..."
            />
          </div>

          {/* Category & Zone */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="category" className="text-sm font-bold text-foreground">
                Category
              </label>
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="flex h-11 w-full rounded-xl border border-border bg-background px-3.5 text-sm font-medium shadow-xs focus:outline-hidden focus:ring-2 focus:ring-lime-400"
              >
                {TASK_CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="zone" className="text-sm font-bold text-foreground">
                Hyperlocal Zone
              </label>
              <select
                id="zone"
                value={zone}
                onChange={(e) => setZone(e.target.value)}
                className="flex h-11 w-full rounded-xl border border-border bg-background px-3.5 text-sm font-medium shadow-xs focus:outline-hidden focus:ring-2 focus:ring-lime-400"
              >
                {HYPERLOCAL_ZONES.map((z) => (
                  <option key={z} value={z}>
                    {z}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Budget Range */}
          <div className="grid sm:grid-cols-2 gap-4 pt-2 border-t border-border/60">
            <div className="space-y-2">
              <label htmlFor="budgetMin" className="text-sm font-bold text-foreground flex items-center justify-between">
                <span>Minimum Budget (₹)</span>
                <span className="text-xs font-normal text-muted-foreground">Min ₹300</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground font-bold">₹</span>
                <input
                  id="budgetMin"
                  type="number"
                  min={300}
                  required
                  value={budgetMin}
                  onChange={(e) => setBudgetMin(e.target.value)}
                  className="flex h-11 w-full rounded-xl border border-border bg-background pl-8 pr-4 text-base font-bold shadow-xs transition-colors focus:outline-hidden focus:ring-2 focus:ring-lime-400"
                  placeholder="400"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="budgetMax" className="text-sm font-bold text-foreground flex items-center justify-between">
                <span>Maximum Budget (₹)</span>
                <span className="text-xs font-normal text-muted-foreground">Upper limit</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground font-bold">₹</span>
                <input
                  id="budgetMax"
                  type="number"
                  min={300}
                  required
                  value={budgetMax}
                  onChange={(e) => setBudgetMax(e.target.value)}
                  className="flex h-11 w-full rounded-xl border border-border bg-background pl-8 pr-4 text-base font-bold shadow-xs transition-colors focus:outline-hidden focus:ring-2 focus:ring-lime-400"
                  placeholder="600"
                />
              </div>
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center justify-center gap-2 rounded-xl text-sm font-extrabold shadow-md h-12 px-6 bg-lime-400 hover:bg-lime-500 text-black w-full transition-all hover:shadow-lg disabled:opacity-50 disabled:pointer-events-none hover-glow-btn"
            >
              {submitting ? "Broadcasting to Buddies..." : "Post task now"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
