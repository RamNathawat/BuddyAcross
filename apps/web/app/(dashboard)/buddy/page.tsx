"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, Radar, Wallet, Zap, Calendar, IndianRupee, ArrowRight, ListTodo } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import { useTasks } from "@/lib/hooks/useTasks";
import { HYPERLOCAL_ZONES } from "@/lib/constants/zones";

export default function BuddyDashboardPage() {
  const [userName, setUserName] = useState("Buddy");
  const [authorized, setAuthorized] = useState(false);
  const [selectedZone, setSelectedZone] = useState<string>("All");
  const router = useRouter();
  const supabase = createClient();
  const { tasks, loading, error, refetch } = useTasks({ status: "open" });

  const filteredTasks = selectedZone === "All" ? tasks : tasks.filter((t) => t.zone === selectedZone);

  useEffect(() => {
    async function initDashboard() {
      let userId = localStorage.getItem("buddy_user_id");
      if (!userId) {
        const { data: authData } = await supabase.auth.getUser();
        if (authData?.user?.id) {
          userId = authData.user.id;
          localStorage.setItem("buddy_user_id", userId);
        }
      }

      if (userId) {
        try {
          const { data: userRow } = await supabase.from("users").select("full_name, role").eq("id", userId).single();
          if (userRow?.full_name) {
            setUserName(userRow.full_name);
            localStorage.setItem("buddy_user_name", userRow.full_name);
          }
          if (userRow?.role) {
            localStorage.setItem("buddy_user_role", userRow.role);
          }

          const { data: profileRow } = await supabase.from("buddy_profiles").select("kyc_status").eq("user_id", userId).single();
          if (profileRow?.kyc_status) {
            localStorage.setItem("buddy_kyc_status", profileRow.kyc_status);
          }
        } catch {}
      } else {
        const savedName = localStorage.getItem("buddy_user_name");
        if (savedName) setUserName(savedName);
      }

      const { data: authData } = await supabase.auth.getUser();
      const role = (authData?.user?.app_metadata?.role as string) || (authData?.user?.user_metadata?.role as string) || localStorage.getItem("buddy_user_role") || "buddy";

      if (role !== "buddy") {
        toast.error("Unauthorized access");
        router.push("/unauthorized");
        return;
      }

      const kycStatus = localStorage.getItem("buddy_kyc_status") || "unverified";

      if (kycStatus === "unverified") {
        toast.info("Please complete your KYC onboarding");
        router.push("/onboarding/kyc");
        return;
      }

      if (kycStatus !== "approved") {
        toast.warning("Your KYC is still pending review");
        router.push("/pending-approval");
        return;
      }

      setAuthorized(true);
    }
    initDashboard();
  }, [router]);

  if (!authorized) {
    return <div className="p-12 text-center text-muted-foreground animate-pulse font-medium">Verifying Buddy security access...</div>;
  }

  return (
    <div className="space-y-6 animate-fade-in relative">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-8 rounded-2xl bg-gradient-to-r from-lime-400/15 via-background to-card border-2 border-border shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-lime-400/10 rounded-full blur-2xl pointer-events-none" />
        <div className="space-y-2 relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-lime-400/10 border border-lime-400/30 text-lime-600 dark:text-lime-400 text-xs font-bold">
            <Zap className="size-3" /> Hyperlocal Buddy Partner
          </div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-extrabold tracking-tight">Hello, {userName}! 👋</h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-lime-400 text-black text-xs font-bold shadow-xs glow-lime">
              <ShieldCheck className="size-3.5" /> KYC Verified
            </span>
          </div>
          <p className="text-sm text-muted-foreground max-w-md">
            You are cleared and verified to accept tasks across your Bengaluru hyperlocal zone.
          </p>
        </div>
        <Link
          href="/buddy/bids"
          className="inline-flex items-center justify-center gap-2 rounded-xl text-sm font-extrabold shadow-md h-11 px-6 bg-lime-400 hover:bg-lime-500 text-black transition-all hover:shadow-lg hover-glow-btn shrink-0 relative z-10"
        >
          <ListTodo className="size-4" /> My Bids
        </Link>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-2 border-border hover:border-lime-400/40 transition-all shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-20 h-20 bg-lime-400/5 rounded-full blur-xl group-hover:bg-lime-400/15 transition-colors" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-bold">Trust Status</CardTitle>
            <div className="p-2 rounded-lg bg-lime-400/10 text-lime-600 dark:text-lime-400">
              <ShieldCheck className="size-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-extrabold text-lime-600 dark:text-lime-400">Approved</div>
            <p className="text-xs text-muted-foreground mt-1">Aadhaar &amp; Selfie verified.</p>
          </CardContent>
        </Card>

        <Card className="border-2 border-border hover:border-lime-400/40 transition-all shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-20 h-20 bg-lime-400/5 rounded-full blur-xl group-hover:bg-lime-400/15 transition-colors" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-bold">Zone Radius</CardTitle>
            <div className="p-2 rounded-lg bg-secondary text-foreground">
              <Radar className="size-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-extrabold">5.0 km</div>
            <p className="text-xs text-muted-foreground mt-1">Bengaluru Hyperlocal Zone.</p>
          </CardContent>
        </Card>

        <Card className="border-2 border-border hover:border-lime-400/40 transition-all shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-20 h-20 bg-lime-400/5 rounded-full blur-xl group-hover:bg-lime-400/15 transition-colors" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-bold">Total Earnings</CardTitle>
            <div className="p-2 rounded-lg bg-secondary text-foreground">
              <Wallet className="size-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-extrabold">₹0</div>
            <p className="text-xs text-muted-foreground mt-1">Unlocks with bids in Phase 3.</p>
          </CardContent>
        </Card>
      </div>

      {/* Live Marketplace Feed */}
      <div className="space-y-4 pt-2">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-extrabold tracking-tight">Open tasks in your zones</h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              Browse live chores posted by neighbors across Bengaluru
            </p>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={selectedZone}
              onChange={(e) => setSelectedZone(e.target.value)}
              className="h-10 rounded-xl border border-border bg-card px-3 py-1.5 text-sm font-medium shadow-xs focus:outline-hidden focus:ring-2 focus:ring-lime-400 w-full sm:w-48"
            >
              <option value="All">All Zones</option>
              {HYPERLOCAL_ZONES.map((z) => (
                <option key={z} value={z}>{z}</option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="grid md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-44 rounded-xl border bg-card p-6 animate-pulse space-y-3">
                <div className="h-5 bg-muted rounded-md w-1/3" />
                <div className="h-6 bg-muted rounded-md w-3/4" />
                <div className="h-4 bg-muted rounded-md w-1/2 mt-4" />
              </div>
            ))}
          </div>
        ) : error ? (
          <Card className="p-8 text-center border-2 border-destructive/20 bg-destructive/5">
            <p className="text-sm font-bold text-destructive">{error}</p>
            <button onClick={() => refetch()} className="mt-3 px-4 py-2 rounded-lg bg-background border border-border text-xs font-bold shadow-xs hover:bg-accent">
              Try Again
            </button>
          </Card>
        ) : filteredTasks.length === 0 ? (
          <Card className="p-12 text-center border-2 border-dashed border-border bg-card/40">
            <div className="mx-auto w-12 h-12 rounded-full bg-lime-400/10 flex items-center justify-center text-lime-600 dark:text-lime-400 mb-3">
              <Radar className="size-6" />
            </div>
            <h3 className="font-bold text-lg">No open tasks right now</h3>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto mt-1">
              {selectedZone !== "All"
                ? `No chores currently listed in ${selectedZone}. Try selecting All Zones to view opportunities citywide.`
                : "Neighbors haven't posted any open tasks yet. Check back soon!"}
            </p>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {filteredTasks.map((t) => (
              <Link
                key={t.id}
                href={`/buddy/tasks/${t.id}`}
                className="rounded-xl border border-border bg-card text-card-foreground shadow-xs hover:border-lime-400/60 transition-all hover:shadow-md group block p-6 relative overflow-hidden"
              >
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-bold bg-lime-400/15 text-lime-600 dark:text-lime-400 border-lime-400/30">
                    {t.zone}
                  </span>
                  <span className="text-xs font-semibold text-muted-foreground bg-secondary px-2.5 py-0.5 rounded-full">
                    {t.bidCount} {t.bidCount === 1 ? "bid" : "bids"}
                  </span>
                </div>
                <h3 className="font-extrabold text-lg mt-2 group-hover:text-lime-600 dark:group-hover:text-lime-400 transition-colors line-clamp-2">
                  {t.title}
                </h3>
                <p className="text-xs text-muted-foreground line-clamp-1 mt-1">{t.description}</p>
                <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between">
                  <div className="text-xs text-muted-foreground flex items-center gap-1.5 font-medium">
                    <Calendar className="size-3.5 text-lime-600 dark:text-lime-400" />
                    <span>Posted {new Date(t.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</span>
                  </div>
                  <div className="text-base font-extrabold flex items-center text-foreground">
                    <IndianRupee className="size-4 text-lime-600 dark:text-lime-400 mr-0.5" />
                    {t.budgetMin === t.budgetMax ? t.budgetMin : `${t.budgetMin}–${t.budgetMax}`}
                  </div>
                </div>
                <div className="mt-4">
                  <span className="inline-flex items-center justify-center gap-2 rounded-xl text-sm font-bold shadow-xs h-9 px-4 py-2 bg-lime-400 group-hover:bg-lime-500 text-black w-full transition-colors">
                    Place Bid <ArrowRight className="size-4 ml-1 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
