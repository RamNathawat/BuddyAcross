"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { PlusCircle, ListTodo, ShieldCheck, Zap, Calendar, IndianRupee, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { useTasks } from "@/lib/hooks/useTasks";

export default function TaskerDashboardPage() {
  const [userName, setUserName] = useState("Tasker");
  const [city, setCity] = useState("Bengaluru");
  const [userId, setUserId] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();
  const { tasks, loading, error, refetch } = useTasks(userId ? { taskerId: userId } : {});

  useEffect(() => {
    async function checkRole() {
      const saved = localStorage.getItem("buddy_user_name");
      if (saved) setUserName(saved);
      const savedCity = localStorage.getItem("buddy_profile_city");
      if (savedCity) setCity(savedCity);

      const token = localStorage.getItem("buddy_auth_token");
      if (token && token !== "demo-token") {
        try {
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/v1/users/me`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (res.ok) {
            const data = await res.json();
            if (data?.data?.user?.fullName) {
              setUserName(data.data.user.fullName);
              localStorage.setItem("buddy_user_name", data.data.user.fullName);
            }
            if (data?.data?.profile?.city) {
              setCity(data.data.profile.city);
              localStorage.setItem("buddy_profile_city", data.data.profile.city);
            }
          }
        } catch {}
      }

      const { data: authData } = await supabase.auth.getUser();
      if (authData?.user?.id) {
        setUserId(authData.user.id);
      } else {
        const localId = localStorage.getItem("buddy_user_id");
        if (localId) setUserId(localId);
      }

      const role = (authData?.user?.app_metadata?.role as string) || (authData?.user?.user_metadata?.role as string) || localStorage.getItem("buddy_user_role") || "tasker";
      if (role !== "tasker") {
        toast.error("Unauthorized access");
        router.push("/unauthorized");
      }
    }
    checkRole();
  }, [router, supabase]);

  return (
    <div className="space-y-6 animate-fade-in relative">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-8 rounded-2xl bg-gradient-to-r from-lime-400/15 via-background to-card border-2 border-border shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-lime-400/10 rounded-full blur-2xl pointer-events-none" />
        <div className="space-y-2 relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-lime-400/10 border border-lime-400/30 text-lime-600 dark:text-lime-400 text-xs font-bold">
            <Zap className="size-3" /> Hyperlocal Poster Hub
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">Welcome back, {userName}! 👋</h1>
          <p className="text-sm text-muted-foreground max-w-md">
            Your Tasker profile is verified for {city} hyperlocal service zones.
          </p>
        </div>
        <Link
          href="/tasker/post"
          className="inline-flex items-center justify-center gap-2 rounded-xl text-sm font-extrabold shadow-md h-11 px-6 bg-lime-400 hover:bg-lime-500 text-black transition-all hover:shadow-lg hover-glow-btn shrink-0"
        >
          <PlusCircle className="size-4" /> Post New Task
        </Link>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-2 border-border hover:border-lime-400/40 transition-all shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-20 h-20 bg-lime-400/5 rounded-full blur-xl group-hover:bg-lime-400/15 transition-colors" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-bold">Account Status</CardTitle>
            <div className="p-2 rounded-lg bg-lime-400/10 text-lime-600 dark:text-lime-400">
              <ShieldCheck className="size-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-extrabold text-lime-600 dark:text-lime-400">Active Poster Account</div>
            <p className="text-xs text-muted-foreground mt-1">Phone verified. Ready to post tasks and hire KYC-verified community Buddies.</p>
          </CardContent>
        </Card>

        <Card className="border-2 border-border hover:border-lime-400/40 transition-all shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-20 h-20 bg-lime-400/5 rounded-full blur-xl group-hover:bg-lime-400/15 transition-colors" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-bold">Active Requirements</CardTitle>
            <div className="p-2 rounded-lg bg-secondary text-foreground">
              <ListTodo className="size-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-extrabold">{tasks.length} {tasks.length === 1 ? "Task" : "Tasks"}</div>
            <p className="text-xs text-muted-foreground mt-1">Live requests posted across Bengaluru.</p>
          </CardContent>
        </Card>
      </div>

      {/* Tasker Posted Tasks Grid */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-extrabold tracking-tight">Your Posted Tasks</h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              Review incoming bids and assign trusted neighborhood Buddies
            </p>
          </div>
        </div>

        {loading && !userId ? (
          <div className="grid md:grid-cols-2 gap-4">
            {[1, 2].map((i) => (
              <div key={i} className="h-44 rounded-xl border bg-card p-6 animate-pulse space-y-3">
                <div className="h-5 bg-muted rounded-md w-1/3" />
                <div className="h-6 bg-muted rounded-md w-3/4" />
                <div className="h-4 bg-muted rounded-md w-1/2 mt-4" />
              </div>
            ))}
          </div>
        ) : tasks.length === 0 ? (
          <Card className="p-12 text-center border-2 border-dashed border-border bg-card/40">
            <div className="mx-auto w-12 h-12 rounded-full bg-lime-400/10 flex items-center justify-center text-lime-600 dark:text-lime-400 mb-3">
              <ListTodo className="size-6" />
            </div>
            <h3 className="font-bold text-lg">You haven&apos;t posted any tasks yet</h3>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto mt-1 mb-4">
              Need everyday errands, cleaning, or home repairs done? Tap below to broadcast your first chore to KYC-verified neighborhood Buddies.
            </p>
            <Link
              href="/tasker/post"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-lime-400 hover:bg-lime-500 text-black font-extrabold text-sm shadow-md hover-glow-btn"
            >
              <PlusCircle className="size-4" /> Post Your First Chore
            </Link>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {tasks.map((t) => (
              <Link
                key={t.id}
                href={`/tasker/tasks/${t.id}`}
                className="rounded-xl border border-border bg-card text-card-foreground shadow-xs hover:border-lime-400/60 transition-all hover:shadow-md group block p-6 relative overflow-hidden"
              >
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-bold bg-lime-400/15 text-lime-600 dark:text-lime-400 border-lime-400/30">
                    {t.zone}
                  </span>
                  <span className={`text-xs font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                    t.status === "open"
                      ? "bg-blue-500/10 text-blue-500 border-blue-500/20"
                      : t.status === "accepted"
                      ? "bg-lime-400/20 text-lime-600 dark:text-lime-400 border-lime-400/30"
                      : "bg-secondary text-muted-foreground border-border"
                  }`}>
                    {t.status}
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
                <div className="mt-4 flex items-center justify-between bg-secondary/50 px-3.5 py-2.5 rounded-xl border border-border/40">
                  <span className="text-xs font-bold text-foreground">
                    {t.bidCount} {t.bidCount === 1 ? "incoming bid" : "incoming bids"}
                  </span>
                  <span className="text-xs font-extrabold text-lime-600 dark:text-lime-400 flex items-center group-hover:translate-x-0.5 transition-transform">
                    Review Bids <ArrowRight className="size-3.5 ml-1" />
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
